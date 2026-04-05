// src/pages/LyricsFill.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUIZ_DURATION = 15;
const AUDIO_PLAY_TIME = 5;
const INTRO_START_TIME = 45;
const NB_QUESTIONS = 8;

const lyricsData = [
  {
    title: "Le Coup de Soleil",
    artist: "Richard Cocciante",
    year: 1984,
    audio_path: "hits/d6089999-5d12-4e84-b544-53f720233241.mp3",
    lyrics: "J'ai reçu un coup de soleil / Sur le cœur et dans les yeux _____",
    missingWord: "de toi",
    choices: ["de toi", "du ciel", "d'amour", "de feu"]
  },
  {
    title: "Banana Split",
    artist: "Lio",
    year: 1982,
    audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3",
    lyrics: "Banana Split, Banana Split / Je veux un banana split _____",
    missingWord: "avec toi",
    choices: ["avec toi", "pour moi", "ce soir", "tout de suite"]
  },
  {
    title: "Amoureux Solitaires",
    artist: "Lio",
    year: 1980,
    audio_path: "hits/8d7b280b-3e53-439a-87df-a43426da3c3e.mp3",
    lyrics: "Amoureux solitaires / On est tous des _____",
    missingWord: "amoureux solitaires",
    choices: ["amoureux solitaires", "cœurs brisés", "rêveurs fous", "âmes perdues"]
  },
  {
    title: "Il jouait du piano debout",
    artist: "France Gall",
    year: 1980,
    audio_path: "hits/7108c43f-9bee-4944-9df6-797f4c734652.mp3",
    lyrics: "Il jouait du piano debout / Comme s'il y avait le _____",
    missingWord: "feu",
    choices: ["feu", "diable", "vent", "monde"]
  },
  {
  title: "L'encre de tes yeux",
  artist: "Francis Cabrel",
  year: 1980,
  audio_path: "hits/e83b24b8-66e9-4c7c-b796-0e4464ded8da.mp3",
  lyrics: "Puisque l'ombre gagne / Puisqu'il n'est pas de montagne _____",
  missingWord: "sans vallée",
  choices: ["sans vallée", "sans soleil", "sans rivière", "sans lumière"]
},
{
  title: "Antisocial",
  artist: "Trust",
  year: 1980,
  audio_path: "hits/67f0e6ad-da3d-4170-ae98-535fcf56a4e3.mp3",
  isGroup: true,
  desc: "Titre culte du groupe de hard rock français Trust, critique de la société et du monde du travail."
},
{
  "title": "L’aventurier",
  "artist": "Indochine",
  "year": 1982,
  "audio_path": "hits/2df829ac-2b0a-4b29-93cb-07038d446cee.mp3",
  "lyrics": "Et soudain surgit face au vent / Bob Morane contre tout _____ et l'aventurier contre tout guerrier",
  "missingWord": "chacal",
  "choices": ["chacal", "guerrier", "sultan", "crocodile"]
},
{
    "title": "Billie Jean",
    "artist": "Michael Jackson",
    "year": 1982,
    "audio_path": "hits/bc5a3a5f-035f-4a25-83c5-049cbb4ad2bc.mp3",
    "lyrics": "She was more like a beauty queen / From a movie _____",
    "missingWord": "scene",
    "choices": ["scene", "screen", "dream", "machine"]
},
{
    "title": "Thriller",
    "artist": "Michael Jackson",
    "year": 1982,
    "audio_path": "hits/bc5a3a5f-035f-4a25-83c5-049cbb4ad2bc.mp3",
    "lyrics": "Cause this is thriller, thriller night / There ain't no second chance _____",
    "missingWord": "against the thing",
    "choices": ["against the thing", "to survive", "to escape", "for me"]
},
{
    "title": "Africa",
    "artist": "Toto",
    "year": 1982,
    "audio_path": "hits/9fe71d83-d973-4ec9-a8ce-16d45a43dd8e.mp3",
    "lyrics": "I hear the drums echoing tonight / But she hears only whispers of some _____",
    "missingWord": "quiet conversation",
    "choices": ["quiet conversation", "distant thunder", "ancient rhythm", "lost memory"]
},
{
    "title": "Like a Virgin",
    "artist": "Madonna",
    "year": 1984,
    "audio_path": "hits/d383e6f2-8d0e-445f-a14d-0ed0853c2454.mp3",
    "lyrics": "Like a virgin / Touched for the very first time _____",
    "missingWord": "by you",
    "choices": ["by you", "by me", "by love", "by fate"]
},
{
    "title": "Take On Me",
    "artist": "a-ha",
    "year": 1985,
    "audio_path": "hits/dfafa623-41ea-42eb-b601-ab9b3e463b1c.mp3",
    "lyrics": "Talking away / I don’t know what I’m to say _____",
    "missingWord": "I’ll say it anyway",
    "choices": ["I’ll say it anyway", "I’ll tell you later", "I’ll sing it now", "I can’t explain"]
},
{
    "title": "Last Christmas",
    "artist": "Wham!",
    "year": 1984,
    "audio_path": "hits/d3db4d04-1be3-465e-ba1e-d7d5e3fbd43f.mp3",
    "lyrics": "Last Christmas, I gave you my heart / But the very next day, you gave it away _____",
    "missingWord": "to someone special",
    "choices": ["to someone special", "forever", "with love", "again"]
},
{
  title: "99 Luftballons",
  artist: "Nena",
  year: 1983,
  audio_path: "hits/eac78863-1210-4074-ab1e-8fcbfbee4be2.mp3",
  lyrics: "Hast du etwas Zeit für mich / Dann singe ich ein Lied für _____",
  missingWord: "dich",
  choices: ["dich", "uns", "euch", "mich"]
},
{
    title: "Rock Me Amadeus",
    artist: "Falco",
    year: 1985,
    audio_path: "hits/3282c69a-444f-40ae-8a15-cc2a8252343f.mp3",
    lyrics: "Er war ein Punker und er lebte in der Großstadt _____",
    missingWord: "Milchkaffee",
    choices: ["Milchkaffee", "Popstar", "Jazzbar", "Revolution"]
},
{
    "title": "Lambada",
    "artist": "Kaoma",
    "year": 1989,
    "audio_path": "hits/96abf6da-8d00-4512-93f4-af419db8e8bc.mp3",
    "lyrics": "Chorando se foi quem um dia só me fez chorar / Chorando se foi _____",
    "missingWord": "quem um dia só me fez chorar",
    "choices": ["quem um dia só me fez chorar", "praiano e azul", "sem você aqui", "no fim do verão"]
},
{
    "title": "Les Lacs du Connemara",
    "artist": "Michel Sardou",
    "year": 1981,
    "audio_path": "hits/06518c2c-0ecf-497f-8239-72355fb5483f.mp3",
    "lyrics": "Terre de feu, pays de vent, de _____ / Où les lacs et les monts se mêlent au présent",
    "missingWord": "granite",
    "choices": ["granite", "pluie", "brouillard", "soleil"]
},
{
  "title": "Partenaire Particulier",
  "artist": "Partenaire Particulier",
  "year": 1986,
  "audio_path": "hits/756132bb-9c6d-40c1-ac2c-55de2dc35145.mp3",
  "lyrics": "Partenaire particulier cherche partenaire _____, débloquée, pas trop timide et une bonne dose de savoir-faire…",
  "missingWord": "particulière",
  "choices": ["particulière", "coincée", "timide", "simple"]
},
{
  "title": "Elle",
  "artist": "Didier Barbelivien",
  "year": 1990,
  "audio_path": "hits/2530d9a3-01b4-48c1-af76-8a6ec848c961.mp3",
  "lyrics": "Elle a la peau couleur du soleil / Elle a le secret des abeilles / Elle sait comment faire _____",
  "missingWord": "des enfants",
  "choices": ["des enfants", "des hommes", "de la pluie", "de la lumière"]
},
{
    "title": "En rouge et noir",
    "artist": "Jeanne Mas",
    "year": 1986,
    "audio_path": "hits/0c12cb4d-9d8e-4f1f-b4b2-33c6fc1a283c.mp3",
    "lyrics": "Je suis tombée _____ / Dans tes bras, sans retour",
    "missingWord": "en rouge et noir",
    "choices": ["en rouge et noir", "de toi", "du ciel", "d'amour"]
},
{
  "title": "Macumba",
  "artist": "Jean‑Pierre Mader",
  "year": 1983,
  "audio_path": "hits/6fa0489c-4651-46d9-a449-cda82bd5e59d.mp3",
  "lyrics": "Macumba, danse‑la, danse‑la / Tous ensemble on fait la _____",
  "missingWord": "macumba",
  "choices": ["macumba", "samba", "salsa", "fiesta"]
},
{
    title: "Africa",
    artist: "Rose Laurens",
    year: 1982,
    audio_path: "hits/c9b5eaef-a2a6-4e43-a144-2894a47e93d4.mp3",
    lyrics: "Africa, j'ai envie de danser comme _____, de m'offrir à ta loi…",
    missingWord: "toi",
    choices: ["toi", "là‑bas", "la nuit", "le vent"]
  },
  {
  "title": "Un autre monde",
  "artist": "Téléphone",
  "year": 1984,
  "audio_path": "hits/20e4dfa9-d7fc-4375-88cd-297ee6396faf.mp3",
  "lyrics": "Je rêvais d'un autre monde / Où la Terre serait _____",
  "missingWord": "ronde",
  "choices": ["ronde", "blonde", "féconde", "lourde"]
},
{
    "title": "Marcia Baïla",
    "artist": "Les Rita Mitsouko",
    "year": 1984,
    "audio_path": "hits/1bcd61d6-dbfc-461a-a32f-d02d878b5435.mp3",
    "lyrics": "Quel est donc ce froid que l'on sent en _____",
    "missingWord": "toi",
    "choices": ["toi", "elle", "Marcia", "vie"]
},
{
  title: "Vertige de l’amour",
  artist: "Alain Bashung",
  year: 1981,
  audio_path: "hits/a4dea949-fd5a-4ebc-8446-176a7dc3e74e.mp3",
  lyrics: "J'ai dû dormir dans un _____ / J'ai dû dormir dans un drap froissé",
  missingWord: "placard",
  choices: ["placard", "hangar", "garage", "couloir"]
},
{
  title: "Nuit de folie",
  artist: "Début de Soirée",
  year: 1988,
  audio_path: "hits/5dee755b-c23c-4e81-9007-7dd4639d3fb9.mp3",
  lyrics: "C'est la nuit de folie / On s'amuse, on danse et on _____",
  missingWord: "oublie",
  choices: ["oublie", "crie", "rit", "part"]
},
{
  "title": "Je te donne",
  "artist": "Jean‑Jacques Goldman & Michael Jones",
  "year": 1985,
  "audio_path": "hits/5ef9b7a8-bd03-4f89-9008-7d6817977e73.mp3",
  "lyrics": "Je te donne toutes mes différences / Tous ces défauts qui sont autant de _____",
  "missingWord": "chances",
  "choices": ["chances", "mots", "amours", "temps"]
},
{
    "title": "Les Tzars",
    "artist": "Indochine",
    "year": 1987,
    "audio_path": "hits/40544b0d-8ebe-4ee0-a7cd-417a68be7039.mp3",
    "lyrics": "…Les yankees s'amusent à Varsovie / Elle en veut aux _____ / Et 1 et 3 et 4 au placard…",
    "missingWord": "tzars",
    "choices": ["yankees", "tzars", "revolutions", "guevara"]
},
{
  title: "Miss Maggie",
  artist: "Renaud",
  year: 1985,
  audio_path: "hits/3fb2c206-549e-4823-b277-1b79efaf544d.mp3",
  lyrics: "Quand je pense à Margaret Thatcher / Je me dis qu'y a quand même des femmes / Qui ont des _____ au cul",
  missingWord: "couilles",
  choices: ["couilles", "tripes", "idées", "valeurs"]
},
{
  title: "Cendrillon",
  artist: "Téléphone",
  year: 1984,
  audio_path: "hits/57108368-1a8b-4dfa-b395-011f9b556b4e.mp3",
  lyrics: "Cendrillon pour ses _____ ans est la plus jolie des enfants",
  missingWord: "vingt",
  choices: ["vingt", "dix-huit", "trente", "seize"]
},
{
  "title": "Tata Yoyo",
  "artist": "Annie Cordy",
  "year": 1980,
  "audio_path": "hits/794e1c5c-b676-46c5-a13f-191643aea78b.mp3",
  "lyrics": "Tata Yoyo, on m'a dit qu'y a même un _____",
  "missingWord": "grelot",
  "choices": ["grelot", "oiseau", "chapeau", "samba"]
},
{
    "title": "Call Me",
    "artist": "Blondie",
    "year": 1980,
    "audio_path": "hits/af845702-b51c-481c-8f3a-8dd92183e6b7.mp3",
    "lyrics": "Call me (call me) on the line / Call me, call me any, anytime _____",
    "missingWord": "you need a love",
    "choices": ["you need a love", "you want a friend", "you feel alone", "you dream tonight"]
},
{
  title: "Down Under",
  artist: "Men at Work",
  year: 1982,
  audio_path: "hits/bbbf5073-47a6-4f79-968e-c983ae73027b.mp3",
  lyrics: "Traveling in a fried-out _____ / On a hippie trail, head full of zombie",
  missingWord: "Kombi",
  choices: ["Kombi", "Cadillac", "Mustang", "Subway"]
},
{
    "title": "Sweet Dreams (Are Made of This)",
    "artist": "Eurythmics",
    "year": 1983,
    "audio_path": "hits/fa980b89-f5e6-4611-84c0-69eb3f6ee645.mp3",
    "lyrics": "Sweet dreams are made of _____ / Who am I to disagree?",
    "missingWord": "this",
    "choices": ["this", "that", "it", "them"]
},
{
    "title": "Karma Chameleon",
    "artist": "Culture Club",
    "year": 1983,
    "audio_path": "hits/ea0b58a7-dc9d-4c85-a9ac-96e1d0581d34.mp3",
    "lyrics": "I'm a man without conviction / I'm a man who doesn't know _____",
    "missingWord": "how to sell a contradiction",
    "choices": ["how to sell a contradiction", "what to feel inside", "how to hide emotions", "how to play my part"]
},
{
    "title": "Careless Whisper",
    "artist": "George Michael",
    "year": 1984,
    "audio_path": "hits/2c6bf6e1-4f87-47f7-9230-4a2979e31eab.mp3",
    "lyrics": "I'm never gonna dance again / Guilty feet have got no rhythm _____",
    "missingWord": "though it's easy to pretend",
    "choices": ["though it's easy to pretend", "and I feel so bad", "but I can't forget", "since you went away"]
},
{
    "title": "I Wanna Dance with Somebody",
    "artist": "Whitney Houston",
    "year": 1987,
    "audio_path": "hits/ea05e389-3b48-46eb-a08a-93ed193b3670.mp3",
    "lyrics": "Oh, I wanna dance with somebody / I wanna feel the _____",
    "missingWord": "heat",
    "choices": ["beat", "heat", "love", "fire"]
},
{
    "title": "Everybody Wants to Rule the World",
    "artist": "Tears for Fears",
    "year": 1985,
    "audio_path": "hits/6e394bbc-d9cf-4109-8093-6ae011695b33.mp3",
    "lyrics": "Welcome to your life / There's no turning back _____",
    "missingWord": "even while we sleep",
    "choices": ["even while we sleep", "just for today", "come what may", "in the night"]
},
{
    "title": "Livin’ on a Prayer",
    "artist": "Bon Jovi",
    "year": 1986,
    "audio_path": "hits/2872942a-ad46-41b8-b116-4499cd509b6a.mp3",
    "lyrics": "Whoa, we're half way there / Whoa-oh, _____",
    "missingWord": "livin' on a prayer",
    "choices": ["livin' on a prayer", "holdin' on tight", "facing the storm", "dreamin' tonight"]
},
{
    "title": "Sweet Child o’ Mine",
    "artist": "Guns N’ Roses",
    "year": 1987,
    "audio_path": "hits/66e9147e-b653-4139-9c11-5fe7e3a58f01.mp3",
    "lyrics": "She's got a smile that it seems to me _____",
    "missingWord": "reminds me of childhood",
    "choices": ["reminds me of childhood", "makes me feel alive", "lights up the night", "takes me away"]
},
{
  "title": "Faith",
  "artist": "George Michael",
  "year": 1987,
  "audio_path": "hits/244fe14d-78f3-4ff4-b487-bc35047c15f5.mp3",
  "lyrics": "Because I gotta ___ in love yeah / First when I was a younger man _____",
  "missingWord": "have faith",
  "choices": ["have faith", "feel good", "lose control", "dance now"]
},
{
    "title": "Like a Prayer",
    "artist": "Madonna",
    "year": 1989,
    "audio_path": "hits/3b759142-8d0f-4ea7-baff-a6549a65064b.mp3",
    "lyrics": "When you call my name, it's like a little _____",
    "missingWord": "prayer",
    "choices": ["prayer", "game", "flame", "dream"]
},
{
    "title": "Another Day in Paradise",
    "artist": "Phil Collins",
    "year": 1989,
    "audio_path": "hits/c5f7e7df-51ce-42c3-8527-0799562fdf5c.mp3",
    "lyrics": "She calls out to the man on the street _____",
    "missingWord": "Can you help me?",
    "choices": ["Can you help me?", "Please ignore me", "I need money", "I want love"]
},
{
  title: "Don’t You Want Me",
  artist: "The Human League",
  year: 1981,
  audio_path: "hits/d1237eab-5f41-4102-a258-64c31a6a9716.mp3",
  lyrics: "Don't you want me baby / Don't you want me _____",
  missingWord: "oh",
  choices: ["oh", "now", "too", "back"]
},
{
  title: "Girls Just Want to Have Fun",
  artist: "Cyndi Lauper",
  year: 1983,
  audio_path: "hits/01149a41-0b21-4938-82ec-b07bbe23cff7.mp3",
  lyrics: "I come home in the morning light / My mother says _____ you gonna live your life right",
  missingWord: "when",
  choices: ["when", "why", "how", "where"]
},
{
    "title": "Hungry Like the Wolf",
    "artist": "Duran Duran",
    "year": 1982,
    "audio_path": "hits/ddabd912-e40d-4209-85bf-f878916263ff.mp3",
    "lyrics": "I'm on the hunt, I'm after you / Mouth is alive with _____",
    "missingWord": "juice",
    "choices": ["juice", "fire", "desire", "flame"]
},
{
    "title": "Do You Really Want to Hurt Me",
    "artist": "Culture Club",
    "year": 1982,
    "audio_path": "hits/f3f90e85-1254-4117-89a5-6af6936cbfb8.mp3",
    "lyrics": "Do you really want to hurt me / Do you really want to make me _____",
    "missingWord": "cry",
    "choices": ["cry", "laugh", "run", "scream"]
},
{
  "title": "Wake Me Up Before You Go-Go",
  "artist": "Wham!",
  "year": 1984,
  "audio_path": "hits/9738b19f-18db-46c9-8e72-8ebf7bded47f.mp3",
  "lyrics": "Wake me up before you go-go / Don't leave me hanging on like a _____",
  "missingWord": "yo-yo",
  "choices": ["yo-yo", "solo", "no-no", "photo"]
},
{
  title: "Radio Ga Ga",
  artist: "Queen",
  year: 1984,
  audio_path: "hits/488caa8b-8007-4532-8441-58fbcedee500.mp3",
  lyrics: "All we hear is radio ga ga / Radio goo goo _____",
  missingWord: "radio ga ga",
  choices: ["radio ga ga", "radio blah blah", "radio boo hoo", "radio oh no"]
},
{
    "title": "867-5309 / Jenny",
    "artist": "Tommy Tutone",
    "year": 1981,
    "audio_path": "hits/4d7b5374-21c2-4997-adfc-6bfe190b6b8e.mp3",
    "lyrics": "Jenny, I got your number / I need to make you mine _____",
    "missingWord": "tonight",
    "choices": ["tonight", "someday", "right now", "forever"]
},
{
  title: "Goody Two Shoes",
  artist: "Adam Ant",
  year: 1982,
  audio_path: "hits/e74d340f-5019-46dd-bc19-db21d15ed219.mp3",
  lyrics: "Don't drink, don't _____ — what do you do?",
  missingWord: "smoke",
  choices: ["smoke", "dance", "think", "sleep"]
},
{
  title: "The Sun Always Shines on T.V.",
  artist: "a-ha",
  year: 1985,
  audio_path: "hits/e1a3ff62-2610-4535-ac0f-bc2a037b427b.mp3",
  lyrics: "Believe me / The sun always shines on _____",
  missingWord: "TV",
  choices: ["TV", "me", "you", "tonight"]
},
{
    "title": "Cruel Summer",
    "artist": "Bananarama",
    "year": 1983,
    "audio_path": "hits/2eb3569d-c330-4428-be59-6fa6bbaa8cd7.mp3",
    "lyrics": "Hot summer streets and the pavements are burning / I sit around trying to smile but the _____",
    "missingWord": "tears start streaming down my face",
    "choices": ["tears start streaming down my face", "sun keeps shining", "ice is melting", "heat is rising"]
},
{
  title: "Do They Know It’s Christmas?",
  artist: "Band Aid",
  year: 1984,
  audio_path: "hits/02377727-7872-4026-8680-ee1ae8847aa8.mp3",
  lyrics: "It's Christmas time, there's no need to be _____",
  missingWord: "afraid",
  choices: ["afraid", "sad", "alone", "worried"]
},
{
  title: "Woman in Love",
  artist: "Barbra Streisand",
  year: 1980,
  audio_path: "hits/f2dede43-10b9-46d2-9cde-91250e82601b.mp3",
  lyrics: "Life is a moment in space / When the dream is gone _____",
  missingWord: "it's a lonelier place",
  choices: ["it's a lonelier place", "love fades away", "nothing remains", "time slips away"]
},
{
    title: "It’s Still Rock and Roll to Me",
    artist: "Billy Joel",
    year: 1980,
    audio_path: "hits/your-audio-file-path.mp3",
    lyrics: "What's the matter with the clothes I'm wearing? / _______",
    missingWord: "Can't you tell that it's out of style",
    choices: [
        "Can't you tell that it's out of style",
        "I like the way it feels",
        "It's a brand new day",
        "Nothing's gonna change my world"
    ]
},
{
    "title": "Uptown Girl",
    "artist": "Billy Joel",
    "year": 1983,
    "audio_path": "hits/ff44fe6c-34c6-48f3-b76d-3d0153a19587.mp3",
    "lyrics": "Uptown girl / She's been living in her _____",
    "missingWord": "uptown world",
    "choices": ["downtown world", "uptown world", "small town", "big city"]
},
{
    "title": "Ride on Time",
    "artist": "Black Box",
    "year": 1989,
    "audio_path": "hits/26fda3c1-fa81-4d82-928c-1fb7b5957e28.mp3",
    "lyrics": "Gonna get up, gonna get up, gonna get up, gonna get down _____",
    "missingWord": "to it",
    "choices": ["to it", "on time", "with you", "right now"]
},
{
    "title": "The Tide Is High",
    "artist": "Blondie",
    "year": 1980,
    "audio_path": "hits/fe3d9678-3175-49c8-842c-d936526627d5.mp3",
    "lyrics": "The tide is high / But I'm holding on _____",
    "missingWord": "to you",
    "choices": ["to you", "for love", "with faith", "with hope"]
},
{
  title: "My Prerogative",
  artist: "Bobby Brown",
  year: 1988,
  audio_path: "hits/4adf2cdc-4393-415a-b939-01b7f9783f7d.mp3",
  lyrics: "Everybody's talking all this stuff about me / Why don't they just let me _____",
  missingWord: "live",
  choices: ["live", "be", "go", "sing"]
},
{
  title: "Do That to Me One More Time",
  artist: "Captain & Tennille",
  year: 1979,
  audio_path: "hits/472a232d-6585-414b-901c-72609405b82f.mp3",
  lyrics: "Do that to me one more time / Once is never enough with a man like _____",
  missingWord: "you",
  choices: ["you", "mine", "this", "love"]
},
{
    title: "Cherchez le garçon",
    artist: "Taxi Girl",
    year: 1980,
    audio_path: "hits/edc4b91d-46bb-439f-b83e-5bba43ff6151.mp3",
    lyrics: "D'une bande magnétique / Un soupir lui échappe / Sur un écran géant _____",
    missingWord: "Ses yeux se ferment",
    choices: ["Ses yeux se ferment", "Une goutte de sang", "Trouvez son nom", "Cherchez le garçon"]
},
{
  title: "Look Away",
  artist: "Chicago",
  year: 1988,
  audio_path: "hits/cf63535b-6819-4339-90a9-2902282824e6.mp3",
  lyrics: "If you see me walking by / And the tears are in my eyes _____ baby, _____",
  missingWord: "look away",
  choices: ["look away", "walk away", "turn away", "run away"]
},
{
  title: "Sailing",
  artist: "Christopher Cross",
  year: 1980,
  audio_path: "hits/edab91b1-d1f7-4546-8e1e-c4c873f91ba0.mp3",
  lyrics: "And if the wind is right you can sail away / And find _____",
  missingWord: "tranquility",
  choices: ["tranquility", "freedom", "paradise", "destiny"]
},
{
    "title": "Coming Up (Live at Glasgow)",
    "artist": "Paul McCartney",
    "year": 1980,
    "audio_path": "hits/b2731f2e-fa51-45b8-826b-e939e39421b9.mp3",
    "lyrics": "You want a love to last forever / One that will never fade away / I want to help you with your problem / Stick around, I _____",
    "missingWord": "say",
    "choices": ["say", "stay", "play", "dance"]
}
];

export default function LyricsFill() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Préparer les questions
  useEffect(() => {
    const shuffled = [...lyricsData]
      .sort(() => 0.5 - Math.random())
      .slice(0, NB_QUESTIONS);
    setQuestions(shuffled);
    setLoading(false);
  }, []);

  // Initialisation audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.85;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});
    setAudioUnlocked(true);
    setAudioError('');
  };

  const playExcerpt = async () => {
    const current = questions[currentIndex];
    if (!current?.audio_path) {
      setAudioError("Aucun fichier audio pour cette question.");
      return;
    }

    const url = getPublicUrl('audio', current.audio_path);
    console.log("🎵 Tentative de lecture pour :", current.title);
    console.log("📁 Chemin dans la DB :", current.audio_path);
    console.log("🔗 URL générée :", url);

    if (!url) {
      setAudioError("Impossible de générer l'URL audio.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = url;
      audio.currentTime = INTRO_START_TIME;

      setIsPlaying(true);
      setAudioError('');

      console.log("▶️ Lecture lancée...");
      await audio.play();
      console.log("✅ Lecture démarrée avec succès");

      setTimeout(() => {
        audio.pause();
        setIsPlaying(false);
        console.log("⏹️ Extrait terminé");
      }, AUDIO_PLAY_TIME * 1000);

    } catch (err) {
      console.error('❌ Erreur lecture audio:', err.name, err.message);
      setIsPlaying(false);

      if (err.name === 'NotSupportedError') {
        setAudioError("Fichier audio introuvable ou format non supporté.\nVérifie que le bucket 'audio' est public et que le fichier existe.");
      } else if (err.name === 'NotAllowedError') {
        setAudioError("Le navigateur bloque la lecture automatique. Clique à nouveau sur le bouton.");
      } else {
        setAudioError("Erreur inconnue : " + err.message);
      }
    }
  };

  const startTimer = () => {
    if (timeLeft > 0) return;
    setTimeLeft(QUIZ_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (chosen) => {
    if (selectedAnswer || !audioUnlocked) return;
    setSelectedAnswer(chosen);
    setShowResult(true);
    clearInterval(timerRef.current);

    if (chosen === questions[currentIndex].missingWord) {
      const timeBonus = Math.floor(timeLeft * 8);
      setScore(prev => prev + 100 + timeBonus);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= NB_QUESTIONS) {
      setGameOver(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(0);
    setAudioError('');
  };

  if (loading) return <div className="text-center py-40 text-3xl animate-pulse">Préparation du Quiz Paroles...</div>;

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-6xl font-bold neon-text mb-12">Quiz Paroles terminé !</h2>
        <p className="text-4xl font-extrabold mb-10">
          Score final : <span className="text-neon-green">{score} points</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <Link to="/challenges" className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black font-bold py-6 px-12 rounded-2xl text-2xl">
            Retour aux défis
          </Link>
          <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl">
            Rejouer →
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="relative max-w-3xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10">Paroles Manquantes</h2>

      <p className="text-3xl mb-8 font-extrabold">
        Question {currentIndex + 1} / {NB_QUESTIONS} – Score : <span className="text-neon-green">{score}</span>
      </p>

      <button
        onClick={audioUnlocked ? playExcerpt : unlockAudio}
        disabled={isPlaying}
        className={`mb-12 px-12 py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg transform hover:scale-105 ${
          isPlaying ? 'bg-gray-700 cursor-wait' : audioUnlocked ? 'bg-neon-blue hover:bg-cyan-400' : 'bg-gradient-to-r from-neon-pink to-neon-green'
        }`}
      >
        {isPlaying ? 'Extrait en cours...' : audioUnlocked ? 'Jouer l\'extrait (5s)' : 'Activer le son & commencer'}
      </button>

      {audioError && (
        <div className="mb-8 p-5 bg-red-950/70 border border-red-500 rounded-2xl text-red-300 text-left">
          {audioError}
        </div>
      )}

      {/* Timer */}
      <div className="mb-12">
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-neon-blue/40">
          <div 
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue transition-all" 
            style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }} 
          />
        </div>
        <p className="mt-3 text-xl font-semibold">
          {timeLeft > 0 ? `${timeLeft}s restantes` : 'Choisis ta réponse après avoir écouté'}
        </p>
      </div>

      <div className="mb-12 p-8 bg-gray-900/60 rounded-2xl border border-neon-purple/40 text-2xl md:text-3xl leading-relaxed min-h-[120px]">
        <p className="text-center">{current.lyrics.replace('_____', '_____')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {current.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => { handleAnswer(choice); startTimer(); }}
            disabled={showResult || !audioUnlocked}
            className={`p-6 rounded-2xl text-xl font-bold transition-all hover:scale-105 ${
              showResult
                ? choice === current.missingWord ? 'bg-green-600 scale-105' : choice === selectedAnswer ? 'bg-red-600' : 'bg-gray-800 opacity-60'
                : 'bg-gradient-to-br from-neon-blue/40 to-neon-purple/30 hover:from-neon-blue/60'
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      {showResult && (
        <div className="mt-8">
          <p className="text-3xl md:text-4xl font-bold mb-8 neon-text">
            {selectedAnswer === current.missingWord
              ? `✓ PARFAIT ! +${100 + Math.floor(timeLeft * 8)} pts`
              : `✗ La bonne réponse était : "${current.missingWord}"`}
          </p>
          <button 
            onClick={nextQuestion} 
            className="bg-gradient-to-r from-neon-pink to-purple-500 text-white font-bold py-6 px-16 rounded-2xl text-2xl hover:shadow-[0_0_50px_rgba(255,0,255,0.6)]"
          >
            Question suivante →
          </button>
        </div>
      )}
    </div>
  );
}