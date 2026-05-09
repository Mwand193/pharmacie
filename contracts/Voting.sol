// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Structure pour un candidat
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    
    // Propriétaire du contrat
    address public owner;
    
    // Liste des candidats
    Candidate[] public candidates;
    
    // Mapping des électeurs (adresse => a voté)
    mapping(address => bool) public hasVoted;
    
    // État du vote
    bool public votingOpen;
    
    // Événements
    event CandidateAdded(uint256 id, string name);
    event VoteCast(address voter, uint256 candidateId);
    
    // Constructeur
    constructor() {
        owner = msg.sender;
        votingOpen = false;
    }
    
    // Ajouter un candidat
    function addCandidate(string memory _name) public {
        require(msg.sender == owner, "Seul le proprietaire peut ajouter un candidat");
        require(!votingOpen, "Vote deja ouvert");
        
        uint256 candidateId = candidates.length;
        candidates.push(Candidate(candidateId, _name, 0));
        
        emit CandidateAdded(candidateId, _name);
    }
    
    // Ouvrir le vote
    function startVoting() public {
        require(msg.sender == owner, "Seul le proprietaire peut ouvrir le vote");
        votingOpen = true;
    }
    
    // Fermer le vote
    function stopVoting() public {
        require(msg.sender == owner, "Seul le proprietaire peut fermer le vote");
        votingOpen = false;
    }
    
    // Voter
    function vote(uint256 _candidateId) public {
        require(votingOpen, "Le vote n'est pas ouvert");
        require(!hasVoted[msg.sender], "Vous avez deja vote");
        require(_candidateId < candidates.length, "Candidat invalide");
        
        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    // Obtenir le nombre de candidats
    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }
    
    // Obtenir un candidat
    function getCandidate(uint256 _id) public view returns (
        uint256 id,
        string memory name,
        uint256 voteCount
    ) {
        require(_id < candidates.length, "Candidat invalide");
        Candidate storage candidate = candidates[_id];
        return (candidate.id, candidate.name, candidate.voteCount);
    }
    
    // Obtenir le gagnant
    function getWinner() public view returns (
        string memory name,
        uint256 voteCount
    ) {
        require(candidates.length > 0, "Pas de candidats");
        
        uint256 winningVoteCount = 0;
        uint256 winnerIndex = 0;
        
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winnerIndex = i;
            }
        }
        
        Candidate storage winner = candidates[winnerIndex];
        return (winner.name, winner.voteCount);
    }
}