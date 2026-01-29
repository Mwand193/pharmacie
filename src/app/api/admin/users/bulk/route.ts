
// app/api/admin/users/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Le fichier doit être au format CSV' },
        { status: 400 }
      );
    }

    // Lire le fichier
    const fileContent = await file.text();
    
    // Détecter automatiquement le séparateur
    const firstLine = fileContent.split('\n')[0];
    const hasSemicolon = firstLine.includes(';');
    const separator = hasSemicolon ? ';' : ',';
    
    console.log('Séparateur détecté:', separator, 'Première ligne:', firstLine);

    // Parser le CSV avec le bon séparateur
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      delimiter: separator // ← AJOUT IMPORTANT
    }) as Array<{
      name: string;
      email: string;
      username: string;
      password: string;
      role: string;
      departement?: string;
      privileged?: string;
      bio?: string;
    }>;

    console.log('Enregistrements parsés:', records.length);
    console.log('Premier enregistrement:', records[0]);

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'Le fichier CSV est vide ou ne contient pas de données valides' },
        { status: 400 }
      );
    }

    // Valider les colonnes requises
    const requiredColumns = ['name', 'email', 'username', 'password', 'role'];
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord));

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Colonnes manquantes: ${missingColumns.join(', ')}. Colonnes trouvées: ${Object.keys(firstRecord).join(', ')}` },
        { status: 400 }
      );
    }

    let created = 0;
    let errors = 0;
    const details = [] as Array<{
      email: string;
      status: 'success' | 'error';
      message: string;
    }>;

    // Traiter chaque enregistrement
    for (const record of records) {
      try {
        const {
          name,
          email,
          username,
          password,
          role,
          departement = '',
          privileged = 'false',
          bio = ''
        } = record;

        console.log('Traitement:', { name, email, username, role });

        // Validation des données
        if (!name || !email || !username || !password || !role) {
          errors++;
          details.push({
            email: email || 'N/A',
            status: 'error',
            message: 'Données manquantes'
          });
          continue;
        }

        // Valider le rôle
        const validRoles = ['admin', 'student', 'teacher', 'alumni', 'check_in_admin'];
        if (!validRoles.includes(role)) {
          errors++;
          details.push({
            email,
            status: 'error',
            message: `Rôle invalide: ${role}`
          });
          continue;
        }

        // Vérifier si l'username existe déjà
        const { data: existingUsername } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (existingUsername) {
          errors++;
          details.push({
            email,
            status: 'error',
            message: 'Nom d\'utilisateur déjà utilisé'
          });
          continue;
        }

        // Vérifier si l'email existe déjà
        const { data: existingEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingEmail) {
          errors++;
          details.push({
            email,
            status: 'error',
            message: 'Email déjà utilisé'
          });
          continue;
        }

        // Hasher le mot de passe
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Créer l'utilisateur
        const { data: user, error: insertError } = await supabase
          .from('users')
          .insert([{
            username,
            email,
            password: hashedPassword,
            name,
            role,
            departement: departement || null,
            privileged: privileged === 'true',
            bio: bio || null,
            active: true
          }])
          .select('id, username, email, name, role, departement, privileged, active, created_at')
          .single();

        if (insertError) {
          console.error('Erreur insertion:', insertError);
          errors++;
          details.push({
            email,
            status: 'error',
            message: `Erreur base de données: ${insertError.message}`
          });
          continue;
        }

        created++;
        details.push({
          email,
          status: 'success',
          message: 'Utilisateur créé avec succès'
        });

      } catch (recordError) {
        console.error('Erreur traitement enregistrement:', recordError);
        errors++;
        details.push({
          email: record.email || 'N/A',
          status: 'error',
          message: 'Erreur lors du traitement'
        });
      }
    }

    // Retourner la réponse avec les bonnes propriétés
    return NextResponse.json({
      created,
      errors,
      message: `Import terminé: ${created} créés, ${errors} erreurs`,
      details
    });

  } catch (error) {
    console.error('Erreur serveur bulk import:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import en masse' },
      { status: 500 }
    );
  }
}

// Mettez aussi à jour le template pour utiliser le point-virgule
export async function GET() {
  try {
    const csvTemplate = `name;email;username;password;role;departement;privileged;bio
Jean Dupont;jean.dupont@email.com;jdupont;password123;student;Informatique;false;Étudiant en informatique
Marie Martin;marie.martin@email.com;mmartin;password123;teacher;Mathématiques;true;Professeur de mathématiques
Pierre Lambert;pierre.lambert@email.com;plambert;password123;admin;Physique;true;Administrateur système
Sophie Bernard;sophie.bernard@email.com;sbernard;password123;check_in_admin;Chimie;false;Responsable check-in
Luc Dubois;luc.dubois@email.com;ldubois;password123;alumni;Biologie;false;Ancien élève`;

    return new NextResponse(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="template-utilisateurs.csv"'
      }
    });

  } catch (error) {
    console.error('Erreur template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du template' },
      { status: 500 }
    );
  }
}