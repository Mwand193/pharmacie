import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Créer une réponse de redirection
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  
  // Supprimer le cookie
  response.cookies.set('user', '', { 
    maxAge: 0, 
    path: '/',
    expires: new Date(0) // Date dans le passé pour suppression immédiate
  });
  
  return response;
}