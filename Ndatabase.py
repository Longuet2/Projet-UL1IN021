import sqlite3
from datetime import datetime

class PongDatabase:
    def __init__(self, db_name='pong_scores.db'):
        self.db_name = db_name
        self.init_database()
    
    def init_database(self):
        """Initialise la base de données avec la table des scores"""
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS game_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player1_name TEXT NOT NULL,
                player2_name TEXT NOT NULL,
                player1_score INTEGER NOT NULL,
                player2_score INTEGER NOT NULL,
                winner TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_game(self, player1_name, player2_name, player1_score, player2_score):
        """Ajoute une partie à l'historique"""
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        
        # Déterminer le gagnant
        if player1_score > player2_score:
            winner = player1_name
        elif player2_score > player1_score:
            winner = player2_name
        else:
            winner = "Égalité"
        
        cursor.execute('''
            INSERT INTO game_history 
            (player1_name, player2_name, player1_score, player2_score, winner)
            VALUES (?, ?, ?, ?, ?)
        ''', (player1_name, player2_name, player1_score, player2_score, winner))
        
        conn.commit()
        game_id = cursor.lastrowid
        conn.close()
        
        return game_id
    
    def get_all_games(self):
        """Récupère tous les jeux (les plus récents en premier)"""
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM game_history ORDER BY timestamp DESC')
        games = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return games
