import RPi.GPIO as GPIO
import time

# --- Configuration des broches ---
BUZZER_PIN = 22  # Broche du buzzer
BUTTON_PIN = 5  # Broche du bouton

GPIO.setmode(GPIO.BCM)
GPIO.setup(BUZZER_PIN, GPIO.OUT)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # pull-up interne

print("Appuie sur le bouton pour faire bipper le buzzer (Ctrl+C pour quitter)")

try:
    while True:
        if GPIO.input(BUTTON_PIN):  # Bouton press�
            GPIO.output(BUZZER_PIN,1)
        else:
            GPIO.output(BUZZER_PIN, 0)
        time.sleep(0.05)

except KeyboardInterrupt:
    print("Arr�t du programme")
finally:
    GPIO.cleanup()
