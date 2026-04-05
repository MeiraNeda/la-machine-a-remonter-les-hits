// src/pages/TrueFalse80s.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ← ajouté pour user (compteur défis)

const QUIZ_DURATION = 12;           // secondes pour répondre
const AUDIO_PLAY_TIME = 5;          // durée de l'extrait
const INTRO_START_TIME = 45;        // début à 45s
const NB_QUESTIONS = 10;            // nombre de rounds

// Liste des affirmations Vrai/Faux 80s (tu peux en ajouter beaucoup plus !)
const statements = [
  {
  text: "La chanson 'Amoureux solitaires' de Lio est une reprise d'une chanson des Stinky Toys",
  isTrue: true,
  related_hit: { 
    title: "Amoureux solitaires", 
    artist: "Lio", 
    year: 1980, 
    audio_path: "hits/8d7b280b-3e53-439a-87df-a43426da3c3e.mp3" 
  },
  explanation: "Oui, la chanson est une reprise du titre 'Lonely Lovers' du groupe punk français Stinky Toys"
},
{
  text: "Le premier grand succès de Lio est 'Banana Split'",
  isTrue: true,
  related_hit: { 
    title: "Banana Split", 
    artist: "Lio", 
    year: 1979, 
    audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3" 
  },
  explanation: "Oui, Banana Split sorti en 1979 est le premier grand tube de Lio"
},
{
  text: "La chanson 'Il jouait du piano debout' de France Gall parle d'un musicien marginal inspiré de Jerry Lee Lewis",
  isTrue: true,
  related_hit: { 
    title: "Il jouait du piano debout", 
    artist: "France Gall", 
    year: 1980, 
    audio_path: "hits/7108c43f-9bee-4944-9df6-797f4c734652.mp3" 
  },
  explanation: "Oui, Michel Berger s'est inspiré du style rebelle du rockeur Jerry Lee Lewis"
},
{
  text: "La chanson 'Le coup de soleil' de Richard Cocciante a été écrite pour la comédie musicale Notre-Dame de Paris",
  isTrue: false,
  related_hit: { 
    title: "Le coup de soleil", 
    artist: "Richard Cocciante", 
    year: 1979, 
    audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3" 
  },
  explanation: "Non, la chanson a été écrite pour le film 'Tout feu tout flamme' et est devenue un grand classique"
},
{
  text: "La chanson 'L'encre de tes yeux' de Francis Cabrel est une reprise d'une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "L'encre de tes yeux", 
    artist: "Francis Cabrel", 
    year: 1980, 
    audio_path: "hits/e83b24b8-66e9-4c7c-b796-0e4464ded8da.mp3" 
  },
  explanation: "Non, 'L'encre de tes yeux' est une chanson originale écrite et composée par Francis Cabrel lui-même pour son album 'Fragile' sorti en 1980. Elle s'inspire du style folk de Bob Dylan mais n'est pas une reprise d'une chanson existante."
},
{
  text: "La chanson 'Antisocial' du groupe Trust est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Antisocial", 
    artist: "Trust", 
    year: 1980,
    audio_path: "hits/67f0e6ad-da3d-4170-ae98-535fcf56a4e3.mp3" 
  },
  explanation: "Non, « Antisocial » est une chanson originale du groupe français Trust, écrite par Bernie Bonvoisin (paroles) et Norbert Krief (musique) pour leur album *Répression* sorti en 1980. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes comme :contentReference[oaicite:0]{index=0}."
},
{
  text: "La chanson 'L’aventurier' du groupe Indochine est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: {
    title: "L’aventurier",
    artist: "Indochine",
    year: 1982,
    audio_path: "hits/2df829ac-2b0a-4b29-93cb-07038d446cee.mp3" 
  },
  explanation: "Non, « L’aventurier » est une chanson originale du groupe français Indochine, écrite par Nicola Sirkis (paroles) et Dominique Nicolas (musique) pour leur premier album *L’Aventurier* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Les démons de minuit' du groupe Images est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Les démons de minuit",
    "artist": "Images",
    "year": 1986,
    audio_path: "hits/4fc2a174-2097-4daf-a65f-b1352f53e349.mp3" 
  },
  "explanation": "Non, « Les démons de minuit » est une chanson originale du groupe français Images, écrite et composée par Richard Seff, Stéphane Després, Philippe Mimouni, Christophe Després et Jean‑Louis Pujade pour leur premier single sorti en 1986. Elle n’est pas une reprise d’une chanson préexistante, même si le groupe a d’abord travaillé sur une version en anglais appelée « Love Emotion » avant d’en faire la version française connue. Elle a depuis été reprise ou remixée par d’autres artistes, mais elle reste à l’origine un titre original du groupe Images. » :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Billie Jean' de Michael Jackson est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Billie Jean", 
    "artist": "Michael Jackson", 
    "year": 1982,
    "audio_path": "hits/bc5a3a5f-035f-4a25-83c5-049cbb4ad2bc.mp3" 
  },
  "explanation": "Non, « Billie Jean » est une chanson originale de Michael Jackson, écrite et composée par lui-même pour son album *Thriller* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou samplée par d’autres artistes."
},
{
  "text": "La chanson 'Thriller' de Michael Jackson est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Thriller", 
    "artist": "Michael Jackson", 
    "year": 1982,
    "audio_path": "hits/bc5a3a5f-035f-4a25-83c5-049cbb4ad2bc.mp3" 
  },
  "explanation": "Non, « Thriller » est une chanson originale de Michael Jackson, écrite par Rod Temperton et produite par Quincy Jones pour l’album *Thriller* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou samplée par d’autres artistes."
},
{
  "text": "La chanson 'Africa' du groupe Toto n'est pas une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Africa", 
    "artist": "Toto", 
    "year": 1982,
    "audio_path": "9fe71d83-d973-4ec9-a8ce-16d45a43dd8e.mp3"
  },
  "explanation": "Non, « Africa » est une chanson originale du groupe de rock américain Toto, écrite et composée par David Paich (paroles et musique) et Jeff Porcaro pour leur album *Toto IV* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes comme le groupe Weezer en 2018. »:contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Like a Virgin' de Madonna est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Like a Virgin", 
    "artist": "Madonna", 
    "year": 1984,
    "audio_path": "hits/d383e6f2-8d0e-445f-a14d-0ed0853c2454.mp3" 
  },
  "explanation": "Non, « Like a Virgin » est une chanson originale écrite par Billy Steinberg et Tom Kelly, et interprétée pour la première fois par Madonna pour son deuxième album studio intitulé *Like a Virgin*, sorti en 1984. Elle n’est pas une reprise d’une chanson existante, même si elle a été reprise par de nombreux artistes par la suite."
},
{
  "text": "La chanson 'Take On Me' du groupe a-ha est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Take On Me", 
    "artist": "a-ha", 
    "year": 1985,
    "audio_path": "hits/dfafa623-41ea-42eb-b601-ab9b3e463b1c.mp3"
  },
  "explanation": "Non, « Take On Me » est une chanson originale du groupe norvégien a-ha, écrite par Pål Waaktaar et Morten Harket. Elle a été initialement enregistrée en 1984 sous une première version, puis réenregistrée et remixée pour devenir le tube international de 1985. Ce n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou remixée par d’autres artistes."
},
{
  "text": "La chanson 'Last Christmas' de Wham! est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Last Christmas", 
    "artist": "Wham!", 
    "year": 1984,
    "audio_path": "hits/d3db4d04-1be3-465e-ba1e-d7d5e3fbd43f.mp3" 
  },
  "explanation": "Non, « Last Christmas » est une chanson originale du duo britannique Wham!, écrite par George Michael pour la sortie de 1984. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par de nombreux artistes dans différents styles."
},
{
  "text": "La chanson '99 Luftballons' de Nena est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "99 Luftballons", 
    "artist": "Nena", 
    "year": 1983,
    "audio_path": "eac78863-1210-4074-ab1e-8fcbfbee4be2.mp3" 
  },
  "explanation": "Non, « 99 Luftballons » est une chanson originale du groupe allemand Nena, écrite par le guitariste Carlo Karges (paroles) et le claviériste Uwe Fahrenkrog-Petersen (musique) pour leur album *Nena* sorti en 1983. Elle n’est pas une reprise d’une chanson préexistante. La chanson est devenue un grand succès international et possède aussi une version en anglais intitulée « 99 Red Balloons »."
},
{
  "text": "La chanson 'Rock Me Amadeus' de Falco est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Rock Me Amadeus", 
    "artist": "Falco", 
    "year": 1985,
    "audio_path": "hits/3282c69a-444f-40ae-8a15-cc2a8252343f.mp3" 
  },
  "explanation": "Non, « Rock Me Amadeus » est une chanson originale du chanteur autrichien Falco, écrite par Falco, Rob Bolland et Ferdi Bolland pour l’album *Falco 3* sorti en 1985. Elle rend hommage au compositeur Wolfgang Amadeus Mozart et n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été remixée et rééditée à plusieurs reprises."
},
{
  text: "La chanson 'Lambada' de Kaoma est une reprise d’une autre chanson",
  isTrue: true,
  related_hit: { 
    title: "Lambada", 
    artist: "Kaoma", 
    year: 1989,
    audio_path: "hits/96abf6da-8d00-4512-93f4-af419db8e8bc.mp3" 
  },
  explanation: "Oui, « Lambada » n’est pas une chanson entièrement originale du groupe Kaoma : il s’agit d’une adaptation/couverture de la chanson « Llorando se fue » du groupe bolivien Los Kjarkas (1981), passée par plusieurs versions intermédiaires. Kaoma l’a enregistrée en portugais sous le titre « Chorando se foi » et l’a popularisée mondialement en 1989. Cette reprise n’a pas été correctement créditée à l’origine, ce qui a donné lieu à des poursuites judiciaires et à un règlement avec les auteurs originaux. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Les Lacs du Connemara' de Michel Sardou est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Les Lacs du Connemara", 
    "artist": "Michel Sardou", 
    "year": 1981,
    "audio_path": "hits/06518c2c-0ecf-497f-8239-72355fb5483f.mp3" 
  },
  "explanation": "Non, « Les Lacs du Connemara » est une chanson originale de Michel Sardou, écrite par Michel Sardou (paroles) et Jacques Revaux (musique) pour son album *Les Lacs du Connemara* sorti en 1981. Elle n’est pas une reprise d’une chanson préexistante, même si elle est devenue un tube emblématique repris lors de concerts et par d’autres artistes."
},
{
  text: "La chanson 'Partenaire particulier' du groupe Partenaire Particulier est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: {
    title: "Partenaire particulier",
    artist: "Partenaire Particulier",
    year: 1985,
    audio_path: "hits/756132bb-9c6d-40c1-ac2c-55de2dc35145.mp3"
  },
  explanation: "Non, « Partenaire particulier » est une chanson originale du groupe français Partenaire Particulier, écrite, composée et interprétée par les membres du groupe (Dominique Delaby, Pierre Béraud‑Sudreau et Éric Fettweis) pour leur album *Jeux interdits* (single sorti en 1985). Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes comme Les Fatals Picards ou Didier Super. "
},
{
  "text": "La chanson « Elle » de Didier Barbelivien est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Elle",
    "artist": "Didier Barbelivien",
    "year": 1980,
    audio_path: "hits/2530d9a3-01b4-48c1-af76-8a6ec848c961.mp3"
  },
  "explanation": "Non, « Elle » est une chanson originale écrite, composée et interprétée par Didier Barbelivien lui‑même. Elle figure parmi les titres de son répertoire et n’est pas une reprise d’une chanson préexistante, même si elle a ensuite pu être reprise/interprétée par d’autres artistes ou dans des performances amateurs. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'En rouge et noir' de Jeanne Mas est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "En rouge et noir", 
    "artist": "Jeanne Mas", 
    "year": 1986,
    "audio_path": "hits/0c12cb4d-9d8e-4f1f-b4b2-33c6fc1a283c.mp3" 
  },
  "explanation": "Non, « En rouge et noir » est une chanson originale de Jeanne Mas, écrite par Romano Musumarra (musique) et Jeanne Mas (paroles) pour son album *Femmes d'aujourd'hui* sorti en 1986. Elle n’est pas une reprise d’une chanson préexistante, même si elle a été reprise ou remixée par d’autres artistes par la suite."
},
{
  "text": "La chanson 'Macumba' de Jean‑Pierre Mader est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Macumba",
    "artist": "Jean‑Pierre Mader",
    "year": 1985,
    "audio_path": "hits/6fa0489c-4651-46d9-a449-cda82bd5e59d.mp3" 
  },
  "explanation": "Non, « Macumba » est une chanson originale écrite et composée par **Jean‑Pierre Mader** et **Richard Seff**, interprétée par Jean‑Pierre Mader pour son album *Microclimats* et sortie en single en 1985. Elle n’est pas une reprise d’un titre antérieur, même si elle a ensuite été reprise par d’autres artistes (par exemple Caravelli, Les Castafiores ou Verónica Castro). La chanson a été initialement destinée à un autre chanteur avant que Mader ne la reprenne lui‑même, mais sa version n’est pas une reprise d’un enregistrement préexistant."
},
{
  text: "La chanson 'Africa' de Rose Laurens est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: {
    title: "Africa",
    artist: "Rose Laurens",
    year: 1982,
    audio_path: "hits/c9b5eaef-a2a6-4e43-a144-2894a47e93d4.mp3"
  },
  explanation: "Non, « Africa » est une chanson originale interprétée par la chanteuse française Rose Laurens, écrite par Jean‑Michel Bériat (paroles) et Jean‑Pierre Goussaud (musique) pour son album *Déraisonnable* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou adaptée par d’autres artistes (par exemple une version allemande en 1983 intitulée « Afrika » ou une version euro‑house par Powerzone en 1993).\" :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Un autre monde' du groupe Téléphone est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Un autre monde",
    "artist": "Téléphone",
    "year": 1984,
    "audio_path": "hits/20e4dfa9-d7fc-4375-88cd-297ee6396faf.mp3"
  },
  "explanation": "Non, « Un autre monde » est une chanson originale du groupe français Téléphone, écrite par Jean-Louis Aubert (paroles et musique) pour leur album *Un autre monde* sorti en 1984. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou adaptée par d’autres artistes."
},
{
  "text": "La chanson 'Marcia Baïla' du groupe Les Rita Mitsouko est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Marcia Baïla",
    "artist": "Les Rita Mitsouko",
    "year": 1984,
    "audio_path": "hits/1bcd61d6-dbfc-461a-a32f-d02d878b5435.mp3"
  },
  "explanation": "Non, « Marcia Baïla » est une chanson originale du duo français Les Rita Mitsouko, composée par Fred Chichin et Catherine Ringer pour leur album *Rita Mitsouko* sorti en 1984. Elle rend hommage à la danseuse argentine Marcia Moretto et n’est pas une reprise d’une chanson préexistante, même si elle a inspiré ou été reprise par d’autres artistes par la suite :contentReference[oaicite:0]{index=0}."
},
{
  text: "La chanson 'Vertige de l’amour' d’Alain Bashung est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Vertige de l’amour", 
    artist: "Alain Bashung", 
    year: 1981,
    audio_path: "hits/a4dea949-fd5a-4ebc-8446-176a7dc3e74e.mp3"
  },
  explanation: "Non, « Vertige de l’amour » est une chanson originale d’Alain Bashung, écrite par Boris Bergman (paroles) et composée par Alain Bashung. Elle est sortie en 1981 sur l’album *Pizza* et est devenue l’un des titres emblématiques du rock français du début des années 80. Ce n’est pas une reprise, même si la chanson a été réinterprétée par différents artistes par la suite."
},
{
  "text": "La chanson 'Nuit de folie' du duo Début de Soirée est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Nuit de folie", 
    "artist": "Début de Soirée", 
    "year": 1986,
    "audio_path": "hits/5dee755b-c23c-4e81-9007-7dd4639d3fb9.mp3" 
  },
  "explanation": "Non, « Nuit de folie » est une chanson originale du duo français Début de Soirée, composée et écrite par Claude Mainguy et Sauveur Pichot. Elle est sortie en 1986 et est devenue l’un des plus grands tubes de la pop française des années 1980. Elle n’est pas une reprise d’une chanson préexistante, même si elle a connu de nombreuses reprises et remixes par la suite."
},
{
  text: "La chanson 'Je te donne' de Jean-Jacques Goldman & Michael Jones (1985) est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Je te donne", 
    artist: "Jean-Jacques Goldman & Michael Jones", 
    year: 1985,
    // (Optionnel: tu peux ajouter un chemin audio si disponible)
    audio_path: "hits/5ef9b7a8-bd03-4f89-9008-7d6817977e73.mp3"
  },
  explanation: "Non, « Je te donne » est une chanson originale écrite, composée et interprétée par Jean-Jacques Goldman et Michael Jones pour l’album *Non homologué* sorti en 1985. Elle n’est pas une reprise d’une chanson préexistante, même si elle a été reprise plus tard par d’autres artistes tels que le boys band Worlds Apart en 1996 ou par des formations comme Génération Goldman. :contentReference[oaicite:0]{index=0}"
},
{
  text: "La chanson 'Les Tzars' du groupe Indochine (1987) est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Les Tzars", 
    artist: "Indochine", 
    year: 1987,
    audio_path: "hits/40544b0d-8ebe-4ee0-a7cd-417a68be7039.mp3"
  },
  explanation: "Non, « Les Tzars » est une chanson originale du groupe français Indochine, écrite par Nicola Sirkis (paroles) et Dominique Nicolas (musique) pour leur album *7000 Danses* sorti en 1987. Elle n’est pas une reprise d’une chanson préexistante. Elle est propre à Indochine et figure aussi sur plusieurs singles et compilations du groupe. Elle a pu être reprise ou interprétée par d’autres artistes ou en live, mais l’originale reste celle d’Indochine. »"
},
{
  "text": "La chanson 'Miss Maggie' de Renaud est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Miss Maggie", 
    "artist": "Renaud", 
    "year": 1985,
    "audio_path": "hits/3fb2c206-549e-4823-b277-1b79efaf544d.mp3" 
  },
  "explanation": "Non, « Miss Maggie » est une chanson originale de Renaud, écrite et composée par lui pour son album *Mistral gagnant* sorti en 1985. La chanson est une critique ironique de la violence masculine et rend hommage aux femmes, en prenant comme figure symbolique Margaret Thatcher (« Maggie »). Elle n’est pas une reprise, même si elle a été interprétée en concert et reprise plus tard par d’autres artistes."
},
{
  "text": "La chanson 'Cendrillon' du groupe Téléphone est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Cendrillon", 
    "artist": "Téléphone", 
    "year": 1984,
    "audio_path": "hits/57108368-1a8b-4dfa-b395-011f9b556b4e.mp3" 
  },
  "explanation": "Non, « Cendrillon » est une chanson originale du groupe français Téléphone, écrite et composée par Jean-Louis Aubert pour l’album *Un autre monde* sorti en 1984. Elle ne s’agit pas d’une reprise d’une chanson existante, même si elle a été reprise ou interprétée par d’autres artistes par la suite."
},
{
  "text": "La chanson 'Tata Yoyo' d’Annie Cordy est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Tata Yoyo",
    "artist": "Annie Cordy",
    "year": 1980,
    "audio_path": "hits/794e1c5c-b676-46c5-a13f-191643aea78b.mp3" 
  },
  "explanation": "Non, « Tata Yoyo » est une chanson originale interprétée par Annie Cordy, sortie en 1980, écrite par Jacques Mareuil (paroles) et composée par Gérard Gustin. Elle n’est pas une reprise d’un titre préexistant, même si elle a ensuite été reprise ou interprétée par d’autres artistes ou candidats dans des émissions. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Call Me' du groupe Blondie est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Call Me",
    "artist": "Blondie",
    "year": 1980,
    "audio_path": "hits/af845702-b51c-481c-8f3a-8dd92183e6b7.mp3"
  },
  "explanation": "Non, « Call Me » est une chanson originale du groupe américain Blondie, écrite par Debbie Harry (paroles) et Giorgio Moroder (musique) pour la bande originale du film *American Gigolo* sortie en 1980. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes ou interprétée en version différente sur scène ou en studio. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Down Under' du groupe Men at Work est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Down Under", 
    "artist": "Men at Work", 
    "year": 1982,
    "audio_path": "hits/bbbf5073-47a6-4f79-968e-c983ae73027b.mp3" 
  },
  "explanation": "Non, « Down Under » est une chanson originale du groupe australien Men at Work, écrite par Colin Hay et Ron Strykert pour leur premier album *Business as Usual* sorti en 1981. Elle est devenue un grand succès international en 1982. La chanson a toutefois fait l’objet d’un procès car la ligne de flûte reprend partiellement la mélodie de la chanson folklorique australienne « Kookaburra », mais « Down Under » n’est pas une reprise d’une chanson préexistante."
},
{
  "text": "La chanson 'Sweet Dreams (Are Made of This)' du groupe Eurythmics est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Sweet Dreams (Are Made of This)", 
    "artist": "Eurythmics", 
    "year": 1983,
    "audio_path": "hits/fa980b89-f5e6-4611-84c0-69eb3f6ee645.mp3" 
  },
  "explanation": "Non, « Sweet Dreams (Are Made of This) » est une chanson originale du duo britannique Eurythmics, écrite par Annie Lennox et Dave Stewart pour leur album du même nom sorti en 1983. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou remixée par d’autres artistes."
},
{
  "text": "La chanson 'Karma Chameleon' du groupe Culture Club est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Karma Chameleon", 
    "artist": "Culture Club", 
    "year": 1983,
    "audio_path": "hits/ea0b58a7-dc9d-4c85-a9ac-96e1d0581d34.mp3" 
  },
  "explanation": "Non, « Karma Chameleon » est une chanson originale du groupe britannique Culture Club, écrite par Boy George, Roy Hay, Mikey Craig et Jon Moss pour leur album *Colour by Numbers* sorti en 1983. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes."
},
{
  "text": "La chanson 'Careless Whisper' de George Michael est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Careless Whisper", 
    "artist": "George Michael", 
    "year": 1984,
    "audio_path": "hits/2c6bf6e1-4f87-47f7-9230-4a2979e31eab.mp3" 
  },
  "explanation": "Non, « Careless Whisper » est une chanson originale écrite par George Michael et Andrew Ridgeley pour le groupe Wham!, bien qu’elle ait été publiée en single sous le nom de George Michael. Elle figure sur l’album *Make It Big* sorti en 1984. Elle n’est pas une reprise d’une chanson préexistante, même si elle a été reprise par de nombreux artistes par la suite."
},
{
  "text": "La chanson 'I Wanna Dance with Somebody' de Whitney Houston est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "I Wanna Dance with Somebody (Who Loves Me)", 
    "artist": "Whitney Houston", 
    "year": 1987,
    "audio_path": "hits/ea05e389-3b48-46eb-a08a-93ed193b3670.mp3"
  },
  "explanation": "Non, « I Wanna Dance with Somebody (Who Loves Me) » est une chanson originale de Whitney Houston, écrite par George Merrill et Shannon Rubicam pour son deuxième album *Whitney* sorti en 1987. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou samplée par d’autres artistes."
},
{
  "text": "La chanson 'Everybody Wants to Rule the World' de Tears for Fears est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Everybody Wants to Rule the World", 
    "artist": "Tears for Fears", 
    "year": 1985,
    "audio_path": "hits/6e394bbc-d9cf-4109-8093-6ae011695b33.mp3" 
  },
  "explanation": "Non, « Everybody Wants to Rule the World » est une chanson originale du groupe britannique Tears for Fears, écrite par Roland Orzabal, Ian Stanley et Chris Hughes pour leur album *Songs from the Big Chair* sorti en 1985. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par de nombreux artistes et utilisée dans divers films et séries."
},
{
  "text": "La chanson 'Livin’ on a Prayer' du groupe Bon Jovi est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Livin’ on a Prayer", 
    "artist": "Bon Jovi", 
    "year": 1986,
    "audio_path": "hits/2872942a-ad46-41b8-b116-4499cd509b6a.mp3"
  },
  "explanation": "Non, « Livin’ on a Prayer » est une chanson originale du groupe américain Bon Jovi, écrite par Jon Bon Jovi, Richie Sambora et Desmond Child pour leur album *Slippery When Wet* sorti en 1986. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par de nombreux artistes et groupes."
},
{
  "text": "La chanson 'Sweet Child o’ Mine' de Guns N’ Roses est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Sweet Child o’ Mine", 
    "artist": "Guns N’ Roses", 
    "year": 1987,
    "audio_path": "hits/66e9147e-b653-4139-9c11-5fe7e3a58f01.mp3" 
  },
  "explanation": "Non, « Sweet Child o’ Mine » est une chanson originale du groupe américain Guns N’ Roses, écrite par Axl Rose (paroles) et Slash, Duff McKagan, Izzy Stradlin (musique) pour leur album *Appetite for Destruction* sorti en 1987. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes."
},
{
  text: "La chanson 'Faith' de :contentReference[oaicite:0]{index=0} (1987) est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Faith", 
    artist: "George Michael", 
    year: 1987,
    audio_path: "hits/244fe14d-78f3-4ff4-b487-bc35047c15f5.mp3" 
  },
  explanation: "Non, « Faith » est une chanson originale écrite, composée et produite par George Michael pour son premier album solo *Faith* sorti en 1987. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou interprétée par de nombreux artistes, et a inspiré des versions ou samples par d’autres (par exemple par Limp Bizkit ou divers artistes mentionnés dans des bases de données de reprises). » :contentReference[oaicite:1]{index=1}"
},
{
  "text": "La chanson 'Like a Prayer' de Madonna est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Like a Prayer",
    "artist": "Madonna",
    "year": 1989,
    "audio_path": "hits/3b759142-8d0f-4ea7-baff-a6549a65064b.mp3"
  },
  "explanation": "Non, « Like a Prayer » est une chanson originale de Madonna, écrite par elle-même et Patrick Leonard pour l'album éponyme *Like a Prayer* sorti en 1989. Elle n’est pas une reprise d’une chanson préexistante, même si elle a inspiré ou été reprise par d’autres artistes par la suite."
},
{
  "text": "La chanson 'Another Day in Paradise' de Phil Collins est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Another Day in Paradise", 
    "artist": "Phil Collins", 
    "year": 1989,
    "audio_path": "hits/c5f7e7df-51ce-42c3-8527-0799562fdf5c.mp3" 
  },
  "explanation": "Non, « Another Day in Paradise » est une chanson originale de :contentReference[oaicite:1]{index=1}, écrite par lui-même pour son album *…But Seriously* sorti en 1989. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes."
},
{
  "text": "La chanson 'Don’t You Want Me' du groupe The Human League est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Don’t You Want Me", 
    "artist": "The Human League", 
    "year": 1981,
    "audio_path": "hits/d1237eab-5f41-4102-a258-64c31a6a9716.mp3" 
  },
  "explanation": "Non, « Don’t You Want Me » est une chanson originale du groupe britannique The Human League. Elle a été écrite par Philip Oakey, Jo Callis et Philip Adrian Wright pour leur album *Dare* sorti en 1981. Le titre est devenu l’un des plus grands succès du groupe et un classique de la synth-pop, mais il ne s’agit pas d’une reprise d’une chanson préexistante, même s’il a ensuite été repris par d’autres artistes."
},
{
  "text": "La chanson 'Girls Just Want to Have Fun' de Cyndi Lauper est une reprise d’une autre chanson",
  "isTrue": true,
  "related_hit": {
    "title": "Girls Just Want to Have Fun",
    "artist": "Cyndi Lauper",
    "year": 1983,
    "audio_path": "hits/01149a41-0b21-4938-82ec-b07bbe23cff7.mp3"
  },
  "explanation": "Oui, « Girls Just Want to Have Fun » est à l’origine une chanson écrite et enregistrée en 1979 par Robert Hazard. La version de Cyndi Lauper sortie en 1983 sur son album *She's So Unusual* est une reprise, mais avec des paroles et une interprétation retravaillées qui en ont fait un hymne pop féministe et un énorme succès international."
},
{
  "text": "La chanson 'Hungry Like the Wolf' de Duran Duran est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Hungry Like the Wolf", 
    "artist": "Duran Duran", 
    "year": 1982,
    "audio_path": "hits/ddabd912-e40d-4209-85bf-f878916263ff.mp3" 
  },
  "explanation": "Non, « Hungry Like the Wolf » est une chanson originale du groupe britannique Duran Duran, écrite par les membres Simon Le Bon, John Taylor, Nick Rhodes, et Andy Taylor pour leur album *Rio* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a été reprise ou remixée par d’autres artistes plus tard."
},
{
  "text": "La chanson « Do You Really Want to Hurt Me » du groupe Culture Club est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Do You Really Want to Hurt Me",
    "artist": "Culture Club",
    "year": 1982,
    "audio_path": "hits/f3f90e85-1254-4117-89a5-6af6936cbfb8.mp3"
  },
  "explanation": "Non, « Do You Really Want to Hurt Me » est une chanson originale du groupe britannique Culture Club, écrite par les membres Boy George, Mikey Craig, Roy Hay et Jon Moss pour leur album *Kissing to Be Clever* sorti en 1982. Elle n’est pas une reprise d’une chanson préexistante, même si elle a depuis été reprise par de nombreux artistes. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Wake Me Up Before You Go-Go' du groupe Wham! est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Wake Me Up Before You Go-Go", 
    "artist": "Wham!", 
    "year": 1984,
    "audio_path": "hits/9738b19f-18db-46c9-8e72-8ebf7bded47f.mp3" 
  },
  "explanation": "Non, « Wake Me Up Before You Go-Go » est une chanson originale du duo britannique Wham!, écrite et composée par George Michael. Elle est sortie en 1984 sur l’album *Make It Big* et est devenue l’un des plus grands succès du groupe. Elle n’est pas une reprise d’une chanson préexistante, même si elle a été reprise ou interprétée par d’autres artistes par la suite."
},
{
  "text": "La chanson 'Radio Ga Ga' du groupe Queen est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Radio Ga Ga", 
    "artist": "Queen", 
    "year": 1984,
    "audio_path": "hits/488caa8b-8007-4532-8441-58fbcedee500.mp3" 
  },
  "explanation": "Non, « Radio Ga Ga » est une chanson originale du groupe Queen, écrite par leur batteur Roger Taylor pour l’album *The Works* sorti en 1984. Elle n’est pas une reprise d’une chanson préexistante. Le morceau rend hommage à l’âge d’or de la radio et critique l’impact croissant de la télévision sur l’industrie musicale."
},
{
  text: "La chanson '867‑5309/Jenny' du groupe Tommy Tutone est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "867‑5309/Jenny", 
    artist: "Tommy Tutone", 
    year: 1981,
    audio_path: "hits/4d7b5374-21c2-4997-adfc-6bfe190b6b8e.mp3"
  },
  explanation: "Non, « 867‑5309/Jenny » est une chanson originale écrite par Alex Call et Jim Keller et interprétée par le groupe américain Tommy Tutone pour leur album *Tommy Tutone 2* sorti en 1981 ; elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été couverte par d’autres artistes et apparaît dans de nombreuses compilations. » :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Goody Two Shoes' de Adam Ant est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Goody Two Shoes",
    "artist": "Adam Ant",
    "year": 1982,
    "audio_path": "hits/e74d340f-5019-46dd-bc19-db21d15ed219.mp3"
  },
  "explanation": "Non, « Goody Two Shoes » est une chanson originale d’Adam Ant. Elle a été écrite par Adam Ant et Marco Pirroni et sortie en 1982 sur l’album *Friend or Foe*. Le morceau n’est pas une reprise, même s’il est devenu un hit international et a été réutilisé ou repris plus tard dans divers médias."
},
{
  "text": "La chanson 'The Sun Always Shines on T.V.' du groupe a-ha est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "The Sun Always Shines on T.V.", 
    "artist": "a-ha", 
    "year": 1985,
    "audio_path": "e1a3ff62-2610-4535-ac0f-bc2a037b427b.mp3" 
  },
  "explanation": "Non, « The Sun Always Shines on T.V. » est une chanson originale du groupe norvégien a-ha. Elle a été écrite principalement par Pål Waaktaar (guitare) et enregistrée pour leur premier album *Hunting High and Low* sorti en 1985. Elle n’est pas une reprise d’une chanson préexistante, même si elle a été reprise plus tard par plusieurs artistes."
},
{
  "text": "La chanson 'Cruel Summer' du groupe Bananarama est-elle une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Cruel Summer",
    "artist": "Bananarama",
    "year": 1983,
    "audio_path": "hits/2eb3569d-c330-4428-be59-6fa6bbaa8cd7.mp3" 
  },
  "explanation": "Non, « Cruel Summer » est une chanson originale du groupe britannique Bananarama, écrite par les membres du groupe (Sara Dallin, Siobhan Fahey, Keren Woodward) avec Steve Jolley et Tony Swain pour leur album *Bananarama* sorti en 1984 (le single est paru en 1983). Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes comme Ace of Base en 1998. :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Do They Know It’s Christmas?' du collectif Band Aid est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Do They Know It’s Christmas?", 
    "artist": "Band Aid", 
    "year": 1984,
    "audio_path": "hits/02377727-7872-4026-8680-ee1ae8847aa8.mp3" 
  },
  "explanation": "Non, « Do They Know It’s Christmas? » est une chanson originale enregistrée par le collectif caritatif Band Aid en 1984. Elle a été écrite spécialement pour l’occasion par Bob Geldof et Midge Ure afin de récolter des fonds pour lutter contre la famine en Éthiopie. Ce n’est donc pas une reprise d’une chanson préexistante, même si elle a ensuite été réenregistrée par d’autres versions de Band Aid (1989, 2004, 2014) et reprise par plusieurs artistes."
},
{
  "text": "La chanson 'Woman in Love' de Barbra Streisand est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Woman in Love", 
    "artist": "Barbra Streisand", 
    "year": 1980,
    "audio_path": "hits/f2dede43-10b9-46d2-9cde-91250e82601b.mp3" 
  },
  "explanation": "Non, « Woman in Love » est une chanson originale interprétée par Barbra Streisand, écrite et composée par Barry Gibb et Robin Gibb des Bee Gees pour son album *Guilty* sorti en 1980. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou interprétée par d’autres artistes."
},
{
  "text": "La chanson 'It’s Still Rock and Roll to Me' de Billy Joel est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "It’s Still Rock and Roll to Me",
    "artist": "Billy Joel",
    "year": 1980,
    "audio_path": "hits/dbd67a41-450e-4ae9-a59d-5754ea56926b.mp3" 
  },
  "explanation": "Non, « It’s Still Rock and Roll to Me » est une chanson originale écrite et interprétée par **Billy Joel** pour son album *Glass Houses* sorti en 1980. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise ou parodiée par d’autres artistes. Par exemple, « It’s Still Billy Joel to Me » est une parodie de « Weird Al » Yankovic, et la chanson a également été couverte par des artistes comme Drake Bell. » :contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Uptown Girl' de Billy Joel est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Uptown Girl", 
    "artist": "Billy Joel", 
    "year": 1983,
    "audio_path": "hits/ff44fe6c-34c6-48f3-b76d-3d0153a19587.mp3"
  },
  "explanation": "Non, « Uptown Girl » est une chanson originale écrite et interprétée par Billy Joel pour son album *An Innocent Man* sorti en 1983. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes, comme Westlife en 2001."
},
{
  text: "La chanson 'Ride on Time' du groupe Black Box est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Ride on Time", 
    artist: "Black Box", 
    year: 1989,
    audio_path: "hits/26fda3c1-fa81-4d82-928c-1fb7b5957e28.mp3"
  },
  explanation: "Non, « Ride on Time » est une chanson originale du groupe italien Black Box, écrite et produite par Daniele Davoli, Mirko Limoni, Valerio Semplici et Dan Hartman pour leur album *Dreamland* sorti en 1990. Elle n’est pas une reprise d’une chanson préexistante ; en revanche elle utilise un **échantillon vocal** non autorisé de la chanson disco « Love Sensation » de Loleatta Holloway (1980) dans sa première version, ce qui a donné lieu à une réforme de la piste avec une nouvelle voix enregistrée. Elle a ensuite été reprise ou samplée par d’autres artistes.:contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'The Tide Is High' du groupe Blondie est une reprise d’une autre chanson",
  "isTrue": true,
  "related_hit": {
    "title": "The Tide Is High",
    "artist": "Blondie",
    "year": 1980,
    "audio_path": "hits/fe3d9678-3175-49c8-842c-d936526627d5.mp3"
  },
  "explanation": "Oui, « The Tide Is High » interprétée par Blondie en 1980 n’est **pas une chanson originale du groupe**, mais une **reprise** d’une chanson rocksteady jamaïcaine écrite par John Holt et initialement enregistrée par  en 1967. La version de Blondie, sortie sur l’album *Autoamerican* en 1980, a connu un immense succès international, atteignant notamment la première place des classements aux États‑Unis et au Royaume‑Uni. Elle a elle-même été reprise plus tard par d’autres artistes comme  en 2002. :contentReference[oaicite:2]{index=2}"
},
{
  "text": "La chanson 'My Prerogative' de Bobby Brown est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "My Prerogative", 
    "artist": "Bobby Brown", 
    "year": 1988,
    "audio_path": "hits/4adf2cdc-4393-415a-b939-01b7f9783f7d.mp3" 
  },
  "explanation": "Non, « My Prerogative » est une chanson originale de Bobby Brown, écrite par Bobby Brown et Gene Griffin pour son album *Don't Be Cruel* sorti en 1988. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes, notamment Britney Spears en 2004."
},
{
  "text": "La chanson 'Do That to Me One More Time' du duo Captain & Tennille est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Do That to Me One More Time", 
    "artist": "Captain & Tennille", 
    "year": 1979,
    "audio_path": "hits/472a232d-6585-414b-901c-72609405b82f.mp3" 
  },
  "explanation": "Non, « Do That to Me One More Time » est une chanson originale du duo américain Captain & Tennille. Elle a été écrite par Toni Tennille et publiée en 1979 sur l’album *Make Your Move*. La chanson est devenue un grand succès au début de 1980, atteignant la première place du Billboard Hot 100. Ce n’est donc pas une reprise, même si elle a pu être interprétée ou reprise par d’autres artistes par la suite."
},
{
  text: "La chanson 'Cherchez le garçon' du groupe Taxi Girl est une reprise d’une autre chanson",
  isTrue: false,
  related_hit: { 
    title: "Cherchez le garçon", 
    artist: "Taxi Girl", 
    year: 1980,
    "audio_path": "hits/edc4b91d-46bb-439f-b83e-5bba43ff6151.mp3" 
  },
  explanation: "Non, « Cherchez le garçon » est une chanson originale du groupe français Taxi Girl, écrite et composée par **Daniel Darc** et **Laurent Sinclair** pour leur single/EP sorti en décembre 1980. Elle n’est pas une reprise d’une chanson préexistante, même si elle a ensuite été reprise par d’autres artistes.:contentReference[oaicite:0]{index=0}"
},
{
  "text": "La chanson 'Look Away' du groupe Chicago est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Look Away", 
    "artist": "Chicago", 
    "year": 1988,
    "audio_path": "hits/cf63535b-6819-4339-90a9-2902282824e6.mp3" 
  },
  "explanation": "Non, « Look Away » est une chanson originale écrite par Diane Warren et interprétée par le groupe américain Chicago. Elle est sortie en 1988 sur l’album *Chicago 19*. La chanson n’est pas une reprise d’un titre préexistant. Elle est devenue un énorme succès et a atteint la première place du Billboard Hot 100 la même année."
},
{
  "text": "La chanson 'Sailing' de Christopher Cross est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": { 
    "title": "Sailing", 
    "artist": "Christopher Cross", 
    "year": 1980,
    "audio_path": "hits/edab91b1-d1f7-4546-8e1e-c4c873f91ba0.mp3" 
  },
  "explanation": "Non, « Sailing » est une chanson originale de Christopher Cross, qu’il a lui-même écrite et composée. Elle est sortie en 1980 sur son premier album *Christopher Cross*. Le titre est devenu l’un de ses plus grands succès et a remporté plusieurs Grammy Awards en 1981, dont Record of the Year et Song of the Year. Bien que la chanson ait été reprise par différents artistes par la suite, elle n’est pas une reprise d’une œuvre préexistante."
},
{
  "text": "La chanson \"Coming Up (Live at Glasgow)\" de Paul McCartney est une reprise d’une autre chanson",
  "isTrue": false,
  "related_hit": {
    "title": "Coming Up (Live at Glasgow)",
    "artist": "Paul McCartney",
    "year": 1980,
    "audio_path": "hits/b2731f2e-fa51-45b8-826b-e939e39421b9.mp3"
  },
  "explanation": "Non, « Coming Up (Live at Glasgow) » est simplement une version live d’une chanson originale écrite et composée par Paul McCartney lui‑même. « Coming Up » est une chanson originale de Paul McCartney, publiée en 1980 sur l’album *McCartney II*. La version enregistrée en concert à Glasgow avec Wings n’est pas une reprise d’un autre artiste ou d’un autre titre ; c’est la même chanson mais interprétée en live. Elle a ensuite été publiée comme version single qui a même connu un grand succès dans les charts, notamment aux États‑Unis. Elle n’est donc pas une reprise non plus d’une chanson préexistante."
}
  // Ajoute tes propres affirmations et hits réels ici
];

export default function TrueFalse80s() {
  const { user } = useAuth(); // ← pour le compteur de défis terminés
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
  const [isCorrectFlash, setIsCorrectFlash] = useState(false);
  const [completedThisGame, setCompletedThisGame] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Compter ce défi dans le compteur global « Défis complétés »
  useEffect(() => {
    if (!user || !gameOver || completedThisGame) return;

    const key = `completed_challenges_${user.id}`;
    const saved = localStorage.getItem(key);
    const currentCount = saved ? parseInt(saved, 10) : 0;
    const newCount = currentCount + 1;

    localStorage.setItem(key, newCount);
    setCompletedThisGame(true);
  }, [gameOver, user, completedThisGame]);

  // Préparer les questions (mélange + sélection)
  useEffect(() => {
    const shuffled = statements.sort(() => 0.5 - Math.random()).slice(0, NB_QUESTIONS);
    setQuestions(shuffled);
    setLoading(false);
  }, []);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.8;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const unlockAudio = () => {
    if (audioUnlocked) return;

    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});

    setAudioUnlocked(true);
    alert("Son activé ! Clique maintenant sur 'Jouer l'extrait (5s)' pour commencer.");
  };

  const playExcerpt = () => {
    const current = questions[currentIndex];
    if (!current?.related_hit?.audio_path) return;

    const url = getPublicUrl('audio', current.related_hit.audio_path);
    if (!url) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.src = url;
    audio.currentTime = INTRO_START_TIME;
    audio.load();

    setIsPlaying(true);

    audio.play().catch(err => {
      if (err.name === 'NotAllowedError') {
        alert("Le navigateur bloque la lecture. Clique à nouveau.");
      }
    });

    setTimeout(() => {
      audio.pause();
      setIsPlaying(false);
    }, AUDIO_PLAY_TIME * 1000);
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

  const handleAnswer = (answer) => {
    if (selectedAnswer || !audioUnlocked) return;

    setSelectedAnswer(answer);
    setShowResult(true);
    clearInterval(timerRef.current);

    const correct = questions[currentIndex].isTrue;
    const userAnswer = answer === 'VRAI';

    if (userAnswer === correct) {
      const timeBonus = Math.floor(timeLeft * 12);
      setScore(prev => prev + 150 + timeBonus);

      // Flash vert + son de bonne réponse
      setIsCorrectFlash(true);
      const ding = new Audio('https://assets.codepen.io/605876/ding.mp3'); // son gratuit court
      ding.volume = 0.6;
      ding.play().catch(() => {});

      setTimeout(() => setIsCorrectFlash(false), 1000);
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
  };

    const saveScore = async () => {
    if (!user) return;

    await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        game_name: "Blind Test Express", // ← change selon le jeu
        score: score
      });
  };

  useEffect(() => {
    if (gameOver) {
      saveScore();
    }
  }, [gameOver]);

  if (loading) return <div className="text-center py-40 text-3xl animate-pulse">Préparation du Vrai ou Faux 80s...</div>;

  if (questions.length < NB_QUESTIONS) {
    return (
      <div className="text-center py-40 text-2xl text-red-400">
        Pas assez d'affirmations pour lancer le jeu.
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-6xl font-bold neon-text mb-12 animate-pulse-slow">
          Vrai ou Faux 80s terminé !
        </h2>

        <p className="text-4xl font-extrabold mb-10">
          Score final : <span className="text-neon-green">{score} points</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <Link
            to="/challenges"
            className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all transform hover:scale-105"
          >
            Retour aux défis
          </Link>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setGameOver(false);
              setSelectedAnswer(null);
              setShowResult(false);
            }}
            className="bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_40px_rgba(255,0,255,0.6)] transition-all transform hover:scale-105"
          >
            Rejouer →
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="relative max-w-2xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      {/* Flash vert quand bonne réponse */}
      {isCorrectFlash && (
        <div className="fixed inset-0 bg-green-500/30 pointer-events-none animate-flash z-50" />
      )}

      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10 tracking-wide animate-pulse-slow">
        Vrai ou Faux 80s
      </h2>

      <p className="text-3xl mb-8 font-extrabold">
        Question {currentIndex + 1} / {NB_QUESTIONS} – Score : <span className="text-neon-green">{score}</span>
      </p>

      {/* Bouton déblocage / jouer */}
      <button
        onClick={audioUnlocked ? playExcerpt : unlockAudio}
        disabled={isPlaying}
        className={`mb-12 px-12 py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg transform hover:scale-105 ${
          isPlaying
            ? 'bg-gray-700 cursor-wait opacity-70'
            : audioUnlocked
            ? 'bg-neon-blue hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]'
            : 'bg-gradient-to-r from-neon-pink to-neon-green hover:shadow-[0_0_50px_rgba(255,0,255,0.7)]'
        }`}
      >
        {isPlaying
          ? 'Extrait en cours...'
          : audioUnlocked
          ? 'Jouer l\'extrait (5s)'
          : 'Activer le son & commencer'}
      </button>

      {/* Message d’aide après déblocage */}
      {audioUnlocked && !isPlaying && timeLeft === 0 && (
        <p className="text-lg text-neon-yellow mb-8 animate-pulse">
          Prêt ? Clique sur « Jouer l'extrait (5s) » pour entendre le tube !
        </p>
      )}

      {/* Barre timer */}
      <div className="mb-12">
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-neon-blue/40 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xl font-semibold">
          {timeLeft > 0 ? `${timeLeft} secondes restantes` : 'Choisis VRAI ou FAUX pour lancer le chrono !'}
        </p>
      </div>

      {/* Question + extrait */}
      <div className="mb-12 p-8 bg-gray-900/60 rounded-2xl border border-neon-purple/40 text-2xl leading-relaxed">
        <p className="text-center mb-6 font-bold">
          {current.text}
        </p>
        <p className="text-center text-lg text-neon-yellow italic">
          {current.related_hit?.title} – {current.related_hit?.artist} ({current.related_hit?.year})
        </p>
      </div>

      {/* Choix VRAI / FAUX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
        <button
          onClick={() => {
            handleAnswer('VRAI');
            startTimer();
          }}
          disabled={showResult || !audioUnlocked}
          className={`p-10 rounded-2xl text-4xl font-bold transition-all duration-300 transform hover:scale-110 ${
            showResult
              ? current.isTrue
                ? 'bg-green-600 scale-110 shadow-[0_0_40px_rgba(0,255,0,0.6)]'
                : selectedAnswer === 'VRAI'
                ? 'bg-red-600 scale-95'
                : 'bg-gray-800 opacity-60'
              : 'bg-gradient-to-br from-green-600/40 to-emerald-700/40 hover:from-green-500 hover:to-emerald-600 border border-green-500/50'
          }`}
        >
          VRAI
        </button>

        <button
          onClick={() => {
            handleAnswer('FAUX');
            startTimer();
          }}
          disabled={showResult || !audioUnlocked}
          className={`p-10 rounded-2xl text-4xl font-bold transition-all duration-300 transform hover:scale-110 ${
            showResult
              ? !current.isTrue
                ? 'bg-green-600 scale-110 shadow-[0_0_40px_rgba(0,255,0,0.6)]'
                : selectedAnswer === 'FAUX'
                ? 'bg-red-600 scale-95'
                : 'bg-gray-800 opacity-60'
              : 'bg-gradient-to-br from-red-600/40 to-rose-700/40 hover:from-red-500 hover:to-rose-600 border border-red-500/50'
          }`}
        >
          FAUX
        </button>
      </div>

      {/* Résultat */}
      {showResult && (
        <div className="mt-8 animate-fade-in">
          <p className="text-3xl md:text-4xl font-bold mb-6 neon-text">
            {selectedAnswer === (current.isTrue ? 'VRAI' : 'FAUX')
              ? `✓ CORRECT ! +${150 + Math.floor(timeLeft * 12)} pts`
              : `✗ C’était ${current.isTrue ? 'VRAI' : 'FAUX'} – ${current.text}`}
          </p>

          <p className="text-xl text-gray-300 mb-8 italic bg-gray-900/40 p-4 rounded-xl border border-neon-blue/30">
            {current.explanation}
          </p>

          <button
            onClick={nextQuestion}
            className="bg-gradient-to-r from-neon-pink via-purple-500 to-neon-blue text-white font-bold py-6 px-16 rounded-2xl text-2xl hover:shadow-[0_0_60px_rgba(255,0,255,0.7)] transition-all transform hover:scale-105"
          >
            Question suivante →
          </button>
        </div>
      )}
    </div>
  );
}