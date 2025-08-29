


================================================================================ 
POLICE HELPER v1.3.1 
================================================================================

Instrucțiuni complete pentru utilizarea aplicației Police Helper, 
o aplicație dezvoltată pentru asistența polițiștilor în activitatea zilnică.

================================================================================ 
INTRODUCERE 
================================================================================

Police Helper este o aplicație desktop care oferă:
- Generator descrieri pentru amenzi și dosare penale cu autocompletare
- Overlay-uri pentru țintă custom, coduri radio și moment zero
- Cronometru pentru teste contra-timp
- Sistem de hotkeys pentru activare/dezactivare overlay-uri, 
                                              pornire/oprire/resetare cronometru
- Sincronizare automată a bazei de date la Codul Penal, Vehicule, Străzi și 
                      Limite de viteză, Șabloane, Setări overlay-uri, hotkey-uri
- Interfață intuitivă și modernă
- Actualizare automată a aplicației la ultima versiune

================================================================================ 
INTERFAȚA PRINCIPALĂ 
================================================================================

HEADER (Bara de sus)
-------------------------
- Logo și titlu "POLICE HELPER" (stânga)
- transparență „tricolor”, dacă nu ești chiar așa patriot
- culoare custom pentru 
- Butoane de control (dreapta):
  * Toggle MDT Overlay (icon: documente)
  * Toggle Radio Codes (icon: walkie-talkie)
  * Toggle Crosshair (icon: țintă)
  * Toggle Cronometru (icon: stopwatch)

- Ceas digital funcțional setat la ora României (format HH:MM:SS) în timp real 
  oriunde te-ai afla în lume

  * Minimize (minimizează fereastra)
  * Maximize/Restore (maximizează/restorează)
  * Close (închide fereastra principală în Tray)
  * Quit (închide aplicația complet)

PAGINA INIȚIALĂ (Landing Page)
-------------------------------------
- Secțiunea "Agent Operator" cu câmpuri pentru:
  * Call-Sign
  * Grad (dropdown cu toate gradele)
  * Nume
  * Buton "Salvează Agent Operator"

- Butoane mari pentru acces rapid la funcții:
  * MDT Helper
  * Țintă Custom
  * Coduri Radio
  * Hotkeys
  * Setări
  * Info


NAVIGARE
-------------
Butoane de navigare în partea de sus:
- MDT Helper 
- Țintă
- Coduri Radio 
- Hotkeys 
- Setări
- Info 

================================================================================ 
MDT HELPER 
================================================================================

MDT Helper - GENERATOR DE DOSARE PENALE
-------------------------------

Rulează Jocul la rezoluția desktopului tău, în modul Windowed Borderless pentru
a putea afișa deasupra jocului overlay-urile Helperului.

- Afișează MDT Helperul cu hotkey
- apasă ` pentru a activa mouse-ul și poți interacționa cu Helperul și jocul
  simultan
- Poți lucra atât în overlay cât și în fereastra principală simultan
- Autocompletare cu diacritice (viteza → viteză) - dacă nu ai diacritice la 
tastatură nu-ți face griji, căutările funcționează și fără, pardon: „fara” :)

================================================================================ 
OVERLAYS 
================================================================================

ȚINTĂ CUSTOM
-----------------
- Overlay transparent cu țintă personalizabilă
- Setări în secțiunea "Țintă":
  * Dimensiune țintă (10-200px)
  * Ajustare verticală (-50px la +50px)
  * Ajustare orizontală (-50px la +50px)
  * Galerie de ținte custom
- Rămâne mereu deasupra tuturor celorlalte aplicații
- Hotkey: Alt+T

CODURI RADIO
-----------------
- Overlay cu coduri radio personalizabile
- Setări în secțiunea "Coduri Radio":
  * Adăugare/ștergere coduri
  * Font și culoare
  * Dimensiune font (8-32px)
  * Poziție overlay (X, Y)
  * Aliniere la stânga sau la dreapta
  * Contur și umbră

MOMENT ZERO
----------------
- Overlay cu text personalizabil 
  („Ai notat acest moment în descriere. Succes!”)
- Setări în secțiunea "Moment Zero":
  * Text afișat
  * Font și culoare
  * Dimensiune (10-200pt)
  * Durată afișare (1-10 secunde)
  * Poziție (X%, Y%)
  * Contur
- La acționarea hotkey-ului se actualizează data și ora la momentul respectiv în 
  MDT Helper

CRONOMETRU
---------------
- Fereastră separată, draggable cu mouse-ul
- Format: minute:secunde:sutimi
- Butoane Start/Stop și Reset 
  (hotkey aferente pentru acționare mai facilă din joc)
- Hotkey afișare/ascundere
- Always on top



================================================================================ 
TROUBLESHOOTING 
================================================================================

PROBLEME POSIBILE
--------------------

Tu să-mi spui dacă găsești ceva

================================================================================ 
SCURTĂTURI TASTATURĂ 
================================================================================

NAVIGARE în fereastra principală
-------------
- Tab: Navigare între câmpuri
- Enter: Confirmare/Submit
- Escape: Anulare/Închidere modal


HOTKEYS care funcționează din joc
----------------
recomandate: 

- Alt+H: Afișează/Ascunde MDT Overlay
- Alt+J: Afișează/Ascunde Ținta
- Alt+Y: Afișează/Ascunde Codurile Radio
- Alt+E: Actualizează Ora în MDT Helper și afișează mesajul setat în Moment Zero
- Alt+U: Afișează/Ascunde Cronometru 
- Alt+P pornește/oprește cronometrul (se va afișa automat dacă nu este afișat)
- Alt+O resetează cronometrul


CRONOMETRU
---------------

Dacă ai dat click pe el, poți folosi tastele:
- Space: Start/Stop
- R: Reset
- Escape: Închidere
Dacă pornești cronometrul cu hotkey, acesta va fi afișat imediat pe ecran, dacă
nu este deja afișat.


FEREASTRA PRINCIPALĂ
-------------------------

- Alt+F4: Închidere aplicație
- F11: Fullscreen
- Ctrl+S: Salvare rapidă

================================================================================ 
CONFIGURARE AVANSATĂ
================================================================================

- Configurații salvate în localStorage
- Baza de date mereu la zi
- Actualizare Aplicație 

PERSONALIZARE
-------------------
- Aspect aplicație și overlay-uri (culori, transparențe, fonturi, dimensiuni,
  poziționare pe ecran, etc.)
- Hotkeys personalizabile

================================================================================ 
SECURITATE 
================================================================================

DATE PERSONALE
--------------------
- Datele sunt salvate local
- Sincronizare opțională și modulară cu GitHub
- Backup local
- Actualizare automată a aplicației prin GitHub

PERMISIUNI
----------------
- Acces la fișiere locale
- Acces la rețea (pentru sincronizare)
- Acces la clipboard

CONFIDENȚIALITATE
-----------------------
- Nu se trimit date către servere externe 
        (doar se primesc date de la GitHub - baza de date și actualizarea)
- Sincronizare opțională și modulară 
        (poți sincroniza automat ce componente dorești din baza de date)
- Backup local
        (poți exporta baza de date și o poți încărca în/din PC)

================================================================================ 
SUPPORT ȘI CONTACT 
================================================================================

Pentru suport tehnic, întrebări sau sugestii:

- Contactează dezvoltatorul: laurentiu.vecerdea@icloud.com

================================================================================
================================================================================
Această aplicație este dezvoltată pentru uzul intern al poliției Los Santos de 
pe serverul B-Zone.
Developers: 
Project Manager & coding: Laur Balaur
Design: Victor Popescu
================================================================================
================================================================================
