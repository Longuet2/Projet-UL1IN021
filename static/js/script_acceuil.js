var joueur1;
var joueur2;

document.addEventListener("keydown", function(e) { //lance le jeu et demande le nom des joueurs quand on appuie sur entrer
    if (e.key === "Enter") {
        identite()
        window.location.href = "/jeu";
    }
});

function identite() //permet aux joueurs d'entrer leurs noms
	{joueur1=prompt('Saisissez le nom du joueur 1.','Joueur 1');
	 if(joueur1 == '')
	   {
	    joueur1 = 'Joueur 1';
	   }
     joueur2 = prompt("Entrez un nom pour le joueur 2 :","Joueur 2");
     if(joueur2 == '')
        {
         joueur2 = 'Joueur 2';
        }
	}
