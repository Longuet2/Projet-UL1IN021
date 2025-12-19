// Écoute de l'appui sur la touche "Entrée"
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        demanderNoms();          // Demande les noms des joueurs
        window.location.href = "/jeu"; // Redirige vers la page du jeu
    }
});

// Fonction pour demander les noms des joueurs via prompt
function demanderNoms() {
    let joueur1 = prompt('Saisissez le nom du joueur 1.', 'Joueur 1') || 'Joueur 1';
    let joueur2 = prompt('Saisissez le nom du joueur 2.', 'Joueur 2') || 'Joueur 2';

    // Stocke les noms dans le localStorage pour qu'ils soient récupérables dans le jeu
    localStorage.setItem('joueur1', joueur1);
    localStorage.setItem('joueur2', joueur2);
}

