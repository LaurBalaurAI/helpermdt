================================================================================ 
POLICE HELPER v1.2.7 
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
- Ceas digital funcțional setat la ora României (format HH:MM:SS) în timp real 
                                                     oriunde te-ai afla în lume
- transparență „tricolor”, dacă nu ești chiar așa patriot
- culoare custom pentru 
- Butoane de control (dreapta):
  * Toggle MDT Overlay (icon: documente)
  * Toggle Radio Codes (icon: walkie-talkie)
  * Toggle Crosshair (icon: țintă)
  * Toggle Cronometru (icon: stopwatch)
  * Minimize (minimizează fereastra)
  * Maximize/Restore (maximizează/restorează)
  * Close (închide fereastra principală în Tray)
  * Quit (închide aplicația complet)


NAVIGARE
-------------
Butoane de navigare în partea de sus:
- MDT Helper 
- Țintă
- Coduri Radio 
- Hotkeys 
- Setări
- Info 

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

================================================================================ 
MDT HELPER 
================================================================================

MDT Helper - GENERATOR DE DOSARE PENALE
-------------------------------

Căutare Infracțiuni
- Câmpul "Verifică infracțiune în Codul Penal"
- Autocompletare cu diacritice (viteza → viteză) (dacă nu ai diacritice la 
                    tastatură nu-ți face griji, căutările funcționează și fără)
- Căutare după articol sau titlu
- Rezultate afișate în timp real

Date Generale
- Nume și CNP suspect
- Adresa completă
- Telefon
- Câmpuri pentru victime și martori

Descrierea Infracțiunii
- Câmp text mare pentru descriere
- Autocompletare pentru locații
- Template-uri predefinite

Sancțiuni
- Amenda (RON)
- Puncte permis
- Arest (zile)
- Câmpuri manuale editabile

Generare Dosar
- Buton "Generează Dosar"
- Export în format text
- Copiere automată în clipboard

AUTOCONSTATARE
-------------------
- Formular similar cu MDT Helper
- Câmpuri specifice pentru autoconstatare
- Generare document autoconstatare

ȘABLOANE
-------------
- Șabloane predefinite pentru diferite tipuri de introducere a descrierilor 
pentru amenzi și dosare penale
- Editor de șabloane personalizate
- Placeholders customuzabili pentru date dinamice

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
  * Layout vertical/orizontal
  * Contur și umbră
- Click-through
- Hotkey: Alt+R

MOMENT ZERO
----------------
- Overlay cu text "ACUM!" personalizabil
- Setări în secțiunea "Moment Zero":
  * Text afișat
  * Font și culoare
  * Dimensiune (10-200pt)
  * Durată afișare (1-10 secunde)
  * Poziție (X%, Y%)
  * Contur
- Click-through
- Hotkey: Alt+Z

CRONOMETRU
---------------
- Fereastră separată, draggable
- Format: minute:secunde:sutimi
- Butoane Start/Stop și Reset (hotkey aferente pentru acționare mai facilă din 
                                                                           joc)
- Hotkey afișare/ascundere: Alt+I
- Poziționare liberă pe ecran
- Always on top

================================================================================ 
HOTKEYS 
================================================================================

- Editare hotkeys personalizate
- Salvare configurații
- Reset la valorile implicite

================================================================================ 
SETĂRI 
================================================================================

SINCRONIZARE
-----------------
- Link baza de date GitHub
- Buton "Setări Sincronizare"
- Modal pentru configurare:
  * Selectare componente de sincronizat
  * Autosincronizare (checkbox)
  * Butoane Aplică/Anulează

SETĂRI AI
--------------
- Prompt-uri AI personalizate
- Corectare gramaticală
- Template-uri AI

SETĂRI GENERAL
-------------------
- Tema aplicației
- Limba interfaței
- Configurații de export

================================================================================ 
FUNCȚII AVANSATE 
================================================================================

SINCRONIZARE AUTOMATĂ
--------------------------
- Sincronizare automată cu GitHub
- Interval configurable
- Notificări de actualizare

EXPORT DATE
----------------
- Export dosare în format text
- Backup configurații
- Export template-uri

BACKUP ȘI RESTAURARE
-------------------------
- Backup automat al datelor
- Restaurare din backup
- Sincronizare între dispozitive

================================================================================ 
TROUBLESHOOTING 
================================================================================

PROBLEME POSIBILE
--------------------

Overlay-urile nu se afișează la prima acțiune a butoanelor din fereastra 
principală sau hotkey-uri: acționează din nou butonul sau hotkey-ul și apoi se 
va afișa/ascunde
- codurile nu se încarcă direct în poziția salvată: mută-l foarte puțin folosind 
sliderele de poziție și poziția overlay-ului se va actualiza
- dacă vreun overlay nu se afișează deloc: Repornește aplicația
- overlay-ul MDT Helper nu va fi transparent la prima afișare după ce ai deschis 
aplicația: pentru a activa transparența deschide overlay-ul, mergi la „Setări” 
„overlay” în stânga 
sus și mută sliderul de la valoarea dorită cu 1 unitate și apoi înapoi, iar
transparența se va activa.

Cronometrul nu apare
- Verifică hotkey Alt+I
- Verifică dacă fereastra principală este ascunsă
- Repornește aplicația

Sincronizarea eșuează
- Verifică link-ul GitHub
- Verifică conexiunea la internet
- Verifică permisiunile fișierelor

LOG-URI ȘI DEBUG
---------------------
- Log-uri în consola dezvoltatorului
- F12 pentru Developer Tools
- Verifică erorile în terminal

================================================================================ 
SCURTĂTURI TASTATURĂ 
================================================================================

NAVIGARE
-------------
- Tab: Navigare între câmpuri
- Enter: Confirmare/Submit
- Escape: Anulare/Închidere modal

OVERLAY-URI
----------------
- Alt+T: Țintă
- Alt+R: Coduri Radio
- Alt+Z: Moment Zero
- Alt+I: Cronometru
- Alt+O: MDT Overlay

CRONOMETRU
---------------
- Space: Start/Stop
- R: Reset
- Escape: Închidere

FEREASTRA PRINCIPALĂ
-------------------------
- Alt+F4: Închidere aplicație
- F11: Fullscreen
- Ctrl+S: Salvare rapidă

================================================================================ 
CONFIGURARE AVANSATĂ
================================================================================

FIȘIERE DE CONFIGURARE
----------------------------
- Configurații salvate în localStorage
- Setări sincronizate cu GitHub
- Backup automat în electron-store

PERSONALIZARE
-------------------
- Template-uri personalizate
- Hotkeys personalizate
- Overlay-uri personalizate

INTEGRARE
---------------
- API GitHub pentru sincronizare
- Export în formate multiple
- Integrare cu sisteme externe

================================================================================ 
SECURITATE 
================================================================================

DATE PERSONALE
--------------------
- Datele sunt salvate local
- Sincronizare opțională cu GitHub
- Backup securizat
- Actualizare automată a aplicației prin GitHub

PERMISIUNI
----------------
- Acces la fișiere locale
- Acces la rețea (pentru sincronizare)
- Acces la clipboard

CONFIDENȚIALITATE
-----------------------
- Nu se trimit date către servere externe (doar se primesc date de la GitHub)
- Sincronizarea este opțională și modulară (poți sincroniza automat ce componente
                                                        dorești din baza de date.
- Backup local securizat (poți exporta baza de date și o poți încărca în/din PC

================================================================================ 
SUPPORT ȘI CONTACT 
================================================================================

Pentru suport tehnic sau întrebări:

- Contactează dezvoltatorul

Această aplicație este dezvoltată pentru uzul intern al poliției Los Santos de 
pe serverul B-Zone.
Developers: 
Project Manager & coding: Laur Balaur
Design: Victor Popescu

================================================================================
pentru probleme, buguri sau sugestii: laurentiu.vecerdea@icloud.com
================================================================================
