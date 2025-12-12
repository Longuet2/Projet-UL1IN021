document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        demanderNoms();
        window.location.href = "/jeu";
    }
});

function demanderNoms() {
    let joueur1 = prompt('Saisissez le nom du joueur 1.', 'Joueur 1') || 'Joueur 1';
    let joueur2 = prompt('Saisissez le nom du joueur 2.', 'Joueur 2') || 'Joueur 2';

    // Stocker dans localStorage pour le jeu
    localStorage.setItem('joueur1', joueur1);
    localStorage.setItem('joueur2', joueur2);
}
  
