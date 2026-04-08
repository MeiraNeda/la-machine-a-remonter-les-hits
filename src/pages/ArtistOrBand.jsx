// src/pages/ArtistOrBand.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ← ajouté pour user

const QUIZ_DURATION = 12;           // secondes pour répondre
const AUDIO_PLAY_TIME = 5;          // durée de l'extrait
const INTRO_START_TIME = 45;        // début à 45s
const NB_QUESTIONS = 10;            // nombre de rounds

// Données statiques pour le jeu (isGroup: true = groupe/duo, false = artiste solo)
const artistData = [
  {
  title: "Il jouait du piano debout",
  artist: "France Gall",
  year: 1983,
  audio_path: "hits/7108c43f-9bee-4944-9df6-797f4c734652.mp3",
  isGroup: false,
  desc: "Chanson pop française écrite par Michel Berger et interprétée par France Gall."
},
{
  title: "Amoureux solitaires",
  artist: "Lio",
  year: 1980,
  audio_path: "hits/8d7b280b-3e53-439a-87df-a43426da3c3e.mp3",
  isGroup: false,
  desc: "Chanson pop new wave interprétée par Lio, écrite par Elli Medeiros et Jacno."
},
{
  title: "Banana Split",
  artist: "Lio",
  year: 1979,
  audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3",
  isGroup: false,
  desc: "Tube pop espiègle qui a lancé la carrière de Lio à la fin des années 1970."
},
{
  title: "Le coup de soleil",
  artist: "Richard Cocciante",
  year: 1979,
  audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3",
  isGroup: false,
  desc: "Ballade emblématique de Richard Cocciante issue de la bande originale du film Les Bronzés."
},
{
  title: "L'encre de tes yeux",
  artist: "Francis Cabrel",
  year: 1980,
  audio_path: "hits/e83b24b8-66e9-4c7c-b796-0e4464ded8da.mp3",
  isGroup: false,
  desc: "Chanson d'amour poétique de Francis Cabrel tirée de son album Fragile."
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
  title: "L’aventurier",
  artist: "Indochine",
  year: 1982,
  audio_path: "hits/2df829ac-2b0a-4b29-93cb-07038d446cee.mp3",
  isGroup: true,
  desc: "Premier grand succès du groupe français de new wave Indochine, inspiré des aventures de Bob Morane."
},
{
  title: "Les démons de minuit",
  artist: "Images",
  year: 1986,
  audio_path: "hits/4fc2a174-2097-4daf-a65f-b1352f53e349.mp3",
  isGroup: true,
  desc: "Groupe français de pop/variété des années 1980, célèbre pour ce tube disco-synthé."
},
{
  title: "Billie Jean",
  artist: "Michael Jackson",
  year: 1982,
  audio_path: "hits/bc5a3a5f-035f-4a25-83c5-049cbb4ad2bc.mp3",
  isGroup: false,
  desc: "Tube emblématique de Michael Jackson issu de l’album Thriller, mélange de pop et de funk."
},
{
  "title": "Thriller",
  "artist": "Michael Jackson",
  "year": 1982,
  "audio_path": "hits/622ba1ae-bacc-47d6-98ca-cda438a054be.mp3",
  "isGroup": false,
  "desc": "Titre emblématique de Michael Jackson issu de l’album Thriller, mélange de pop, funk et éléments de musique électronique."
},
{
  "title": "Africa",
  "artist": "Toto",
  "year": 1982,
  "audio_path": "9fe71d83-d973-4ec9-a8ce-16d45a43dd8e.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Toto, issu de l’album Toto IV, mélange de rock et de pop avec des influences africaines."
},
{
  "title": "Like a Virgin",
  "artist": "Madonna",
  "year": 1984,
  "audio_path": "hits/d383e6f2-8d0e-445f-a14d-0ed0853c2454.mp3",
  "isGroup": false,
  "desc": "Tube emblématique de Madonna, extrait de l’album éponyme, mélange de pop et dance des années 80."
},
{
  "title": "Take On Me",
  "artist": "a-ha",
  "year": 1985,
  "audio_path": "hits/dfafa623-41ea-42eb-b601-ab9b3e463b1c.mp3",
  "isGroup": true,
  "desc": "Chanson emblématique du groupe norvégien a-ha, connue pour son mélange de synthpop et son clip animé innovant."
},
{
  "title": "Last Christmas",
  "artist": "Wham!",
  "year": 1984,
  "audio_path": "hits/d3db4d04-1be3-465e-ba1e-d7d5e3fbd43f.mp3",
  "isGroup": true,
  "desc": "Chanson culte de Wham! sortie en 1984, mélange de pop et de ballade de Noël."
},
{
  title: "99 Luftballons",
  artist: "Nena",
  year: 1983,
  audio_path: "eac78863-1210-4074-ab1e-8fcbfbee4be2.mp3",
  isGroup: true,
  desc: "Tube emblématique du groupe allemand Nena, chanson pop-rock devenue un symbole de la Guerre froide avec son histoire de ballons déclenchant un conflit."
},
{
  title: "Rock Me Amadeus",
  artist: "Falco",
  year: 1985,
  audio_path: "hits/3282c69a-444f-40ae-8a15-cc2a8252343f.mp3",
  isGroup: false,
  desc: "Tube international de Falco inspiré de la vie de Mozart, mélange de pop, rap et synth-pop."
},
{
  "title": "Lambada",
  "artist": "Kaoma",
  "year": 1989,
  "audio_path": "hits/96abf6da-8d00-4512-93f4-af419db8e8bc.mp3",
  "isGroup": true,
  "desc": "Chanson brésilienne devenue un hit mondial, célèbre pour sa mélodie entraînante et sa danse sensuelle."
},
{
  "title": "Les Lacs du Connemara",
  "artist": "Michel Sardou",
  "year": 1981,
  "audio_path": "hits/06518c2c-0ecf-497f-8239-72355fb5483f.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Michel Sardou, inspirée des paysages irlandais du Connemara, mélange de chanson française et de grandiose orchestral."
},
{
  title: "Partenaire Particulier",
  artist: "Partenaire Particulier",
  year: 1985,
  audio_path: "hits/756132bb-9c6d-40c1-ac2c-55de2dc35145.mp3", 
  isGroup: true,
  desc: "Tube emblématique français du groupe new wave/synthpop Partenaire Particulier, sorti en single en 1985 et extrait de l’album Jeux interdits — symbole des années 80 en France."
},
{
  "title": "Elle",
  "artist": "Didier Barbelivien",
  "year": 1982,
  "audio_path": "hits/2530d9a3-01b4-48c1-af76-8a6ec848c961.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Didier Barbelivien, romantique et mélodique, représentant la variété française des années 80."
},
{
  "title": "En rouge et noir",
  "artist": "Jeanne Mas",
  "year": 1986,
  "audio_path": "hits/0c12cb4d-9d8e-4f1f-b4b2-33c6fc1a283c.mp3",
  "isGroup": false,
  "desc": "Tube emblématique de Jeanne Mas, mélange de pop et de new wave des années 1980."
},
{
  "title": "Macumba",
  "artist": "Jean-Pierre Mader",
  "year": 1983,
  "audio_path": "hits/6fa0489c-4651-46d9-a449-cda82bd5e59d.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de Jean-Pierre Mader, mélange de pop et de rythmes dansants des années 80."
},
{
  "title": "Africa",
  "artist": "Rose Laurens",
  "year": 1982,
  "audio_path": "hits/c9b5eaef-a2a6-4e43-a144-2894a47e93d4.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Rose Laurens mêlant pop et influences world, très populaire au début des années 80."
},
{
  "title": "Un autre monde",
  "artist": "Téléphone",
  "year": 1984,
  "audio_path": "hits/20e4dfa9-d7fc-4375-88cd-297ee6396faf.mp3",
  "isGroup": true,
  "desc": "Chanson emblématique du groupe français Téléphone, tirée de l’album du même nom, mélange de rock et de new wave."
},
{
  "title": "Marcia Baïla",
  "artist": "Les Rita Mitsouko",
  "year": 1984,
  "audio_path": "hits/1bcd61d6-dbfc-461a-a32f-d02d878b5435.mp3",
  "isGroup": true,
  "desc": "Chanson emblématique du duo français Les Rita Mitsouko, mélange de rock et de new wave, célèbre pour son énergie et son clip iconique."
},
{
  title: "Vertige de l’amour",
  artist: "Alain Bashung",
  year: 1981,
  audio_path: "hits/a4dea949-fd5a-4ebc-8446-176a7dc3e74e.mp3",
  isGroup: false,
  desc: "Tube rock emblématique d’Alain Bashung, devenu un classique de la scène française du début des années 80."
},
{
  title: "Nuit de folie",
  artist: "Début de Soirée",
  year: 1986,
  audio_path: "hits/5dee755b-c23c-4e81-9007-7dd4639d3fb9.mp3",
  isGroup: true,
  desc: "Tube emblématique du duo Début de Soirée, classique de la pop-dance française des années 80 devenu incontournable en soirée."
},
{
  "title": "Je te donne",
  "artist": "Jean-Jacques Goldman & Michael Jones",
  "year": 1985,
  "audio_path": "hits/5ef9b7a8-bd03-4f89-9008-7d6817977e73.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Jean-Jacques Goldman et Michael Jones, mélange de pop et de ballade, symbolisant le partage et l’amitié."
},
{
  "title": "Les Tzars",
  "artist": "Indochine",
  "year": 1986,
  "audio_path": "hits/40544b0d-8ebe-4ee0-a7cd-417a68be7039.mp3",
  "isGroup": true,
  "desc": "Hit emblématique du groupe français Indochine, tiré de l’album 3. Un mélange de new wave et rock français."
},
{
  title: "Miss Maggie",
  artist: "Renaud",
  year: 1985,
  audio_path: "hits/3fb2c206-549e-4823-b277-1b79efaf544d.mp3",
  isGroup: false,
  desc: "Chanson engagée de Renaud critiquant la guerre et rendant hommage aux femmes, sortie sur l’album *Mistral Gagnant*."
},
{
  title: "Cendrillon",
  artist: "Téléphone",
  year: 1984,
  audio_path: "hits/57108368-1a8b-4dfa-b395-011f9b556b4e.mp3",
  isGroup: true,
  desc: "Titre emblématique du groupe de rock français Téléphone, sorti dans les années 80, racontant l’histoire tragique d’une jeune femme surnommée Cendrillon."
},
{
  "title": "Tata Yoyo",
  "artist": "Annie Cordy",
  "year": 1980,
  "audio_path": "hits/794e1c5c-b676-46c5-a13f-191643aea78b.mp3",
  "isGroup": false,
  "desc": "Chanson populaire et entraînante d’Annie Cordy, pleine de gaieté et de fantaisie."
},
{
  "title": "Call Me",
  "artist": "Blondie",
  "year": 1980,
  "audio_path": "hits/af845702-b51c-481c-8f3a-8dd92183e6b7.mp3",
  "isGroup": true,
  "desc": "Tube emblématique de Blondie mêlant rock et new wave, connu pour son énergie et son refrain accrocheur."
},
{
  "title": "Down Under",
  "artist": "Men at Work",
  "year": 1982,
  "audio_path": "hits/bbbf5073-47a6-4f79-968e-c983ae73027b.mp3",
  "isGroup": true,
  "desc": "Tube emblématique de Men at Work mêlant new wave et pop rock, célèbre pour sa flûte distinctive et ses paroles évoquant l’Australie."
},
{
  "title": "Sweet Dreams (Are Made of This)",
  "artist": "Eurythmics",
  "year": 1983,
  "audio_path": "hits/fa980b89-f5e6-4611-84c0-69eb3f6ee645.mp3",
  "isGroup": true,
  "desc": "Tube emblématique des Eurythmics mêlant synthpop et new wave, connu pour son ambiance hypnotique et son riff de synthé mémorable."
},
{
  "title": "Karma Chameleon",
  "artist": "Culture Club",
  "year": 1983,
  "audio_path": "hits/ea0b58a7-dc9d-4c85-a9ac-96e1d0581d34.mp3",
  "isGroup": true,
  "desc": "Succès emblématique de Culture Club, mélangeant pop et new wave, connu pour son refrain coloré et son style flamboyant."
},
{
  "title": "Careless Whisper",
  "artist": "George Michael",
  "year": 1984,
  "audio_path": "hits/2c6bf6e1-4f87-47f7-9230-4a2979e31eab.mp3",
  "isGroup": false,
  "desc": "Ballade emblématique de George Michael, célèbre pour son solo de saxophone et ses paroles sur la trahison et le regret amoureux."
},
{
  "title": "I Wanna Dance with Somebody",
  "artist": "Whitney Houston",
  "year": 1987,
  "audio_path": "hits/ea05e389-3b48-46eb-a08a-93ed193b3670.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de Whitney Houston, mélangeant pop et dance, célèbre pour son énergie joyeuse et son refrain inoubliable."
},
{
  "title": "Everybody Wants to Rule the World",
  "artist": "Tears for Fears",
  "year": 1985,
  "audio_path": "hits/6e394bbc-d9cf-4109-8093-6ae011695b33.mp3",
  "isGroup": true,
  "desc": "Hit emblématique des années 80 de Tears for Fears, mêlant pop et new wave, célèbre pour son riff de guitare et son message sur le pouvoir et l'ambition."
},
{
  "title": "Livin’ on a Prayer",
  "artist": "Bon Jovi",
  "year": 1986,
  "audio_path": "hits/2872942a-ad46-41b8-b116-4499cd509b6a.mp3",
  "isGroup": true,
  "desc": "Hymne rock emblématique de Bon Jovi, célèbre pour son refrain puissant et son message de persévérance face aux difficultés."
},
{
  "title": "Sweet Child o’ Mine",
  "artist": "Guns N’ Roses",
  "year": 1987,
  "audio_path": "hits/66e9147e-b653-4139-9c11-5fe7e3a58f01.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Guns N’ Roses mêlant hard rock et riffs de guitare mémorables, célèbre pour son solo et son refrain puissant."
},
{
  "title": "Faith",
  "artist": "George Michael",
  "year": 1987,
  "audio_path": "hits/244fe14d-78f3-4ff4-b487-bc35047c15f5.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de George Michael mélangeant pop et rock, célèbre pour son riff de guitare entraînant et son clip iconique."
},
{
  "title": "Like a Prayer",
  "artist": "Madonna",
  "year": 1989,
  "audio_path": "3b759142-8d0f-4ea7-baff-a6549a65064b.mp3",
  "isGroup": true,
  "desc": "Tube emblématique de Madonna mêlant pop et gospel, célèbre pour son clip controversé et son refrain puissant."
},
{
  "title": "Another Day in Paradise",
  "artist": "Phil Collins",
  "year": 1989,
  "audio_path": "hits/c5f7e7df-51ce-42c3-8527-0799562fdf5c.mp3",
  "isGroup": false,
  "desc": "Ballade emblématique de Phil Collins dénonçant l'indifférence face à la pauvreté, connue pour son atmosphère mélancolique et sa mélodie poignante."
},
{
  "title": "Don’t You Want Me",
  "artist": "The Human League",
  "year": 1981,
  "audio_path": "hits/d1237eab-5f41-4102-a258-64c31a6a9716.mp3",
  "isGroup": true,
  "desc": "Grand classique de la synth-pop des années 80 par The Human League, célèbre pour son duo vocal et son refrain irrésistible."
},
{
  "title": "Girls Just Want to Have Fun",
  "artist": "Cyndi Lauper",
  "year": 1983,
  "audio_path": "hits/01149a41-0b21-4938-82ec-b07bbe23cff7.mp3",
  "isGroup": false,
  "desc": "Tube pop iconique de Cyndi Lauper célébrant l’indépendance et la joie de vivre, devenu un hymne des années 80 avec son refrain entraînant."
},
{
  "title": "Hungry Like the Wolf",
  "artist": "Duran Duran",
  "year": 1982,
  "audio_path": "hits/ddabd912-e40d-4209-85bf-f878916263ff.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Duran Duran mêlant new wave et pop rock, connu pour son rythme entraînant et son clip visuel marquant."
},
{
  "title": "Do You Really Want to Hurt Me",
  "artist": "Culture Club",
  "year": 1982,
  "audio_path": "hits/f3f90e85-1254-4117-89a5-6af6936cbfb8.mp3",
  "isGroup": true,
  "desc": "Succès emblématique de Culture Club mêlant new wave et soul, porté par la voix unique de Boy George et son style flamboyant."
},
{
  "title": "Wake Me Up Before You Go-Go",
  "artist": "Wham!",
  "year": 1984,
  "audio_path": "hits/9738b19f-18db-46c9-8e72-8ebf7bded47f.mp3",
  "isGroup": true,
  "desc": "Tube pop énergique de Wham! devenu un symbole des années 80, célèbre pour son rythme dansant, ses synthés accrocheurs et son refrain joyeux."
},
{
  "title": "Radio Ga Ga",
  "artist": "Queen",
  "year": 1984,
  "audio_path": "hits/488caa8b-8007-4532-8441-58fbcedee500.mp3",
  "isGroup": true,
  "desc": "Tube emblématique de Queen au son synth-pop des années 80, célèbre pour son refrain fédérateur et ses claquements de mains repris par le public."
},
{
  "title": "867-5309/Jenny",
  "artist": "Tommy Tutone",
  "year": 1981,
  "audio_path": "hits/4d7b5374-21c2-4997-adfc-6bfe190b6b8e.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Tommy Tutone des années 80, mêlant rock et pop, célèbre pour son numéro de téléphone devenu légendaire et son refrain mémorable."
},
{
  "title": "Goody Two Shoes",
  "artist": "Adam Ant",
  "year": 1982,
  "audio_path": "hits/e74d340f-5019-46dd-bc19-db21d15ed219.mp3",
  "isGroup": false,
  "desc": "Tube pop-rock emblématique d'Adam Ant, connu pour son rythme entraînant et ses paroles satiriques sur la célébrité et l'image publique."
},
{
  "title": "The Sun Always Shines on T.V.",
  "artist": "a-ha",
  "year": 1985,
  "audio_path": "hits/e1a3ff62-2610-4535-ac0f-bc2a037b427b.mp3",
  "isGroup": true,
  "desc": "Tube emblématique du groupe norvégien mêlant synth-pop et new wave, célèbre pour son atmosphère dramatique et la voix puissante de Morten Harket."
},
{
  "title": "Cruel Summer",
  "artist": "Bananarama",
  "year": 1983,
  "audio_path": "hits/2eb3569d-c330-4428-be59-6fa6bbaa8cd7.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Bananarama, mêlant pop et new wave, célèbre pour son atmosphère estivale mélancolique et son refrain mémorable."
},
{
  "title": "Do They Know It’s Christmas?",
  "artist": "Band Aid",
  "year": 1984,
  "audio_path": "hits/02377727-7872-4026-8680-ee1ae8847aa8.mp3",
  "isGroup": true,
  "desc": "Chanson caritative emblématique réunissant de nombreux artistes britanniques et irlandais pour récolter des fonds contre la famine en Éthiopie, devenue un classique de Noël."
},
{
  "title": "Woman in Love",
  "artist": "Barbra Streisand",
  "year": 1980,
  "audio_path": "hits/f2dede43-10b9-46d2-9cde-91250e82601b.mp3",
  "isGroup": false,
  "desc": "Ballade pop emblématique interprétée par Barbra Streisand, écrite par les Bee Gees, célèbre pour sa mélodie poignante et son immense succès international."
},
{
  "title": "It’s Still Rock and Roll to Me",
  "artist": "Billy Joel",
  "year": 1980,
  "audio_path": "hits/dbd67a41-450e-4ae9-a59d-5754ea56926b.mp3",
  "isGroup": false,
  "desc": "Tube phare de Billy Joel combinant rock et pop, célèbre pour son message ironique sur la mode musicale et son rythme entraînant."
},
{
  "title": "Uptown Girl",
  "artist": "Billy Joel",
  "year": 1983,
  "audio_path": "hits/ff44fe6c-34c6-48f3-b76d-3d0153a19587.mp3",
  "isGroup": true,
  "desc": "Chanson pop emblématique de Billy Joel, évoquant l'histoire d'amour entre un homme simple et une jeune fille sophistiquée, avec un style inspiré des doo-wop des années 60."
},
{
  "title": "Ride on Time",
  "artist": "Black Box",
  "year": 1989,
  "audio_path": "hits/26fda3c1-fa81-4d82-928c-1fb7b5957e28.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Black Box mélangeant house et dance, célèbre pour son sample puissant et son énergie irrésistible."
},
{
  "title": "The Tide Is High",
  "artist": "Blondie",
  "year": 1980,
  "audio_path": "hits/fe3d9678-3175-49c8-842c-d936526627d5.mp3",
  "isGroup": true,
  "desc": "Reprise reggae-pop emblématique de Blondie, célèbre pour sa mélodie douce et son style détendu qui contraste avec leurs titres plus rock."
},
{
  "title": "My Prerogative",
  "artist": "Bobby Brown",
  "year": 1988,
  "audio_path": "hits/4adf2cdc-4393-415a-b939-01b7f9783f7d.mp3",
  "isGroup": false,
  "desc": "Tube emblématique de Bobby Brown mêlant R&B et new jack swing, célèbre pour son groove puissant et son message d’indépendance."
},
{
  "title": "Do That to Me One More Time",
  "artist": "Captain & Tennille",
  "year": 1979,
  "audio_path": "hits/472a232d-6585-414b-901c-72609405b82f.mp3",
  "isGroup": true,
  "desc": "Ballade pop douce et sensuelle du duo Captain & Tennille, célèbre pour sa mélodie romantique et son ambiance disco-soft typique de la fin des années 70."
},
{
  "title": "Cherchez le garçon",
  "artist": "Taxi Girl",
  "year": 1980,
  "audio_path": "hits/edc4b91d-46bb-439f-b83e-5bba43ff6151.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Taxi Girl mêlant new wave et synthpop, connu pour son style élégant et son ambiance dansante."
},
{
  "title": "Look Away",
  "artist": "Chicago",
  "year": 1988,
  "audio_path": "hits/cf63535b-6819-4339-90a9-2902282824e6.mp3",
  "isGroup": true,
  "desc": "Ballade rock emblématique de Chicago écrite par Diane Warren, connue pour son refrain puissant et son succès au sommet des classements à la fin des années 80."
},
{
  "title": "Sailing",
  "artist": "Christopher Cross",
  "year": 1979,
  "audio_path": "hits/edab91b1-d1f7-4546-8e1e-c4c873f91ba0.mp3",
  "isGroup": false,
  "desc": "Ballade douce et emblématique de Christopher Cross, mêlant soft rock et yacht rock, célèbre pour son ambiance apaisante et ses arrangements élégants."
},
{
  "title": "Coming Up (Live at Glasgow)",
  "artist": "Paul McCartney",
  "year": 1979,
  "audio_path": "hits/b2731f2e-fa51-45b8-826b-e939e39421b9.mp3",
  "isGroup": false,
  "desc": "Version live dynamique de Paul McCartney interprétant 'Coming Up' à Glasgow, mêlant énergie rock et funk, très appréciée pour son engagement sur scène."
},
{
  "title": "Enjoy the Silence",
  "artist": "Depeche Mode",
  "year": 1990,
  "audio_path": "hits/e95fb79a-f16c-4097-a8f5-533c236da326.mp3,",
  "isGroup": true,
  "desc": "Hit emblématique de Depeche Mode mêlant synth-pop et new wave, reconnu pour son ambiance mélancolique et son refrain mémorable."
},
{
  "title": "Come On Eileen",
  "artist": "Dexys Midnight Runners",
  "year": 1982,
  "audio_path": "hits/4f63ec47-aa8f-498d-b1da-8d711fc6dfe6.mp3",
  "isGroup": true,
  "desc": "Chanson emblématique mêlant pop et soul, célèbre pour son refrain entraînant et son énergie festive."
},
{
  "title": "That’s What Friends Are For",
  "artist": "Dionne Warwick",
  "year": 1985,
  "audio_path": "hits/73363726-26f2-48ad-9f00-0452522c4cf5.mp3",
  "isGroup": false,
  "desc": "Ballade pop-soul emblématique réunissant Dionne Warwick avec Elton John, Gladys Knight et Stevie Wonder, célébrant l’amitié et la solidarité."
},
{
  "title": "Ebony and Ivory",
  "artist": "Paul McCartney & Stevie Wonder",
  "year": 1982,
  "audio_path": "hits/893a5a1b-760b-490a-a6f2-3ce5b7efd781.mp3",
  "isGroup": true,
  "desc": "Tube emblématique prônant l’harmonie raciale, alignant les touches noires et blanches du piano comme métaphore de coexistence — ici partagé via la chaîne Reelblack One."
},
{
  "title": "Week-end à Rome",
  "artist": "Etienne Daho",
  "year": 1984,
  "audio_path": "hits/633a627d-bb84-47da-b719-851f1109de83.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique d’Etienne Daho, mêlant pop et new wave, avec une atmosphère romantique et un style sophistiqué."
},
{
  "title": "Der Kommissar",
  "artist": "Falco",
  "year": 1981,
  "audio_path": "hits/def51103-9e33-4fe0-921e-d62445b54818.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de Falco mélangeant pop et new wave, célèbre pour son rythme entraînant et son style unique de rap chanté en allemand."
},
{
  "title": "Relax",
  "artist": "Frankie Goes To Hollywood",
  "year": 1983,
  "audio_path": "hits/d314e3f9-f0d0-4042-b3c4-6f7195c5bb36.mp3",
  "isGroup": true,
  "desc": "Titre new wave provocateur et très énergique de Frankie Goes To Hollywood, célèbre pour son refrain puissant et sa polémique lors de sa sortie."
},
{
  "title": "Two Tribes",
  "artist": "Frankie Goes To Hollywood",
  "year": 1984,
  "audio_path": "hits/32a649cb-889f-4b9a-b016-e705983fe988.mp3",
  "isGroup": true,
  "desc": "Tube new wave et synthpop au ton provocateur, célèbre pour sa production explosive et ses paroles inspirées par les tensions de la guerre froide."
},
{
  "title": "One More Try",
  "artist": "George Michael",
  "year": 1988,
  "audio_path": "hits/a6ceaba0-cb0c-45e8-9e96-33ea34ef8f5a.mp3",
  "isGroup": false,
  "desc": "Ballade soul emblématique de George Michael, mettant en avant sa voix émotive et sa sensibilité musicale."
},
{
  "title": "Plus près des étoiles",
  "artist": "Gold",
  "year": 1985,
  "audio_path": "hits/cfcb6edd-5f1e-41c2-bd81-9feafba40fe7.mp3",
  "isGroup": true,
  "desc": "Chanson emblématique du groupe Gold, symbole de la pop française des années 80, connue pour son refrain fédérateur et son énergie positive."
},
{
  "title": "Hard to Say I’m Sorry",
  "artist": "Chicago",
  "year": 1982,
  "audio_path": "a162d02f-d4ae-4862-8ddc-7d59e3570769.mp3",
  "isGroup": true,
  "desc": "Ballade pop-rock emblématique du groupe Chicago, célèbre pour son piano doux, ses harmonies vocales et son refrain émotionnel."
},
{
  "title": "Fame",
  "artist": "Irene Cara",
  "year": 1980,
  "audio_path": "hits/a44d7f2f-5547-445d-9a55-ea9edbc85175.mp3",
  "isGroup": false,
  "desc": "Chanson culte interprétée par Irene Cara pour le film 'Fame', mêlant pop et disco avec un message sur la célébrité et l’ambition."
},
{
  "title": "Tombé du ciel",
  "artist": "Jacques Higelin",
  "year": 1988,
  "audio_path": "hits/c14d9e6b-84cf-4ffb-85be-3085f5094b97.mp3",
  "isGroup": false,
  "desc": "Chanson poétique et imaginative de Jacques Higelin, mélangeant rock et chanson française, célèbre pour sa légèreté et son atmosphère aérienne."
},
{
  "title": "Nasty",
  "artist": "Janet Jackson",
  "year": 1986,
  "audio_path": "hits/496a72ea-52cf-4446-aa32-adcf7beccfc7.mp3",
  "isGroup": true,
  "desc": "Hymne emblématique de Janet Jackson mêlant funk et R&B, célèbre pour son attitude audacieuse et son refrain percutant."
},
{
  "title": "Comme toi",
  "artist": "Jean-Jacques Goldman",
  "year": 1982,
  "audio_path": "hits/ad0ff03c-7740-4795-9dee-583ce6d5f0a4.mp3",
  "isGroup": false,
  "desc": "Chanson émouvante de Jean-Jacques Goldman racontant l’histoire d’une petite fille juive pendant la Seconde Guerre mondiale, avec une mélodie douce et des paroles poignantes."
},
{
  "title": "The Power of Love",
  "artist": "Jennifer Rush",
  "year": 1984,
  "audio_path": "hits/d91596f7-1fd3-40e5-aa83-03276d47ca59.mp3",
  "isGroup": false,
  "desc": "Ballade puissante de Jennifer Rush devenue un classique des années 80, célèbre pour sa montée émotionnelle et la performance vocale impressionnante de la chanteuse."
},
{
  "title": "Don’t Stop Believin’",
  "artist": "Journey",
  "year": 1981,
  "audio_path": "hits/dbb3285d-0613-4acc-8c09-96988cfc6a4f.mp3",
  "isGroup": true,
  "desc": "Hymne rock emblématique de Journey, célèbre pour son riff de piano mémorable et son message optimiste inspirant."
},
{
  "title": "Ève lève-toi",
  "artist": "Julie Pietri",
  "year": 1986,
  "audio_path": "hits/eb819e61-affb-4dea-92a8-04913f4f92c8.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Julie Pietri mêlant pop et variété française, célèbre pour son message féminin fort et son refrain marquant."
},
{
  "title": "Please Don’t Go",
  "artist": "KC & The Sunshine Band",
  "year": 1979,
  "audio_path": "hits/a0141c24-4e57-4daf-a398-dc4266fea4fb.mp3",
  "isGroup": true,
  "desc": "Ballade disco emblématique du groupe KC & The Sunshine Band, célèbre pour sa mélodie douce et ses émotions romantiques."
},
{
  "title": "Footloose",
  "artist": "Kenny Loggins",
  "year": 1984,
  "audio_path": "hits/cc0ce054-c4dc-4e73-bca7-947d84a1619d.mp3",
  "isGroup": false,
  "desc": "Tube emblématique de Kenny Loggins tiré du film Footloose, mélangeant pop rock et énergie dansante avec un refrain très entraînant."
},
{
  "title": "Gloria",
  "artist": "Laura Branigan",
  "year": 1982,
  "audio_path": "hits/94eff5e9-5d28-480c-acac-68d276d5f94c.mp3",
  "isGroup": false,
  "desc": "Tube emblématique de Laura Branigan mêlant pop et synth-pop, connu pour sa voix puissante et son refrain entraînant."
},
{
  "title": "Self Control",
  "artist": "Laura Branigan",
  "year": 1984,
  "audio_path": "hits/4c8c6138-9452-43cc-b1d3-18be6ebe470f.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de Laura Branigan mélangeant pop et synthpop des années 80, célèbre pour son refrain puissant et son atmosphère nocturne et dramatique."
},
{
  "title": "Funkytown",
  "artist": "Lipps Inc.",
  "year": 1980,
  "audio_path": "hits/7186ebc5-97f7-4759-936e-215fde5f354c.mp3",
  "isGroup": true,
  "desc": "Hit disco emblématique de Lipps Inc., reconnu pour son groove irrésistible et son refrain entraînant qui a marqué la fin des années 70 et le début des années 80."
},
{
  "title": "Working for the Weekend",
  "artist": "Loverboy",
  "year": 1981,
  "audio_path": "hits/5ffcae27-36ae-433e-8f84-47c2abe0ab7a.mp3",
  "isGroup": true,
  "desc": "Hymne rock emblématique de Loverboy célébrant le week-end et l'esprit festif, connu pour ses riffs puissants et son refrain entraînant."
},
{
  "title": "You Got It (The Right Stuff)",
  "artist": "New Kids on the Block",
  "year": 1988,
  "audio_path": "hits/801e7065-a6b5-4c9f-bb72-f107f28c9ee6.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de New Kids on the Block combinant pop et R&B, connu pour ses harmonies vocales et son refrain entraînant."
},
{
  "title": "L'amour à la plage",
  "artist": "Niagara",
  "year": 1986,
  "audio_path": "hits/9d6faf6d-b899-4cbd-9d83-ccf69811fbba.mp3",
  "isGroup": true,
  "desc": "Tube pop français emblématique du duo Niagara, mêlant synthpop et ambiance estivale, célèbre pour son refrain léger et nostalgique sur les amours de vacances."
},
{
  "title": "Magic",
  "artist": "Olivia Newton-John",
  "year": 1980,
  audio_path: "hits/c5a7fb1a-0c91-4bec-99d9-0f175a993c65.mp3",
  "isGroup": false,
  "desc": "Ballade pop emblématique d’Olivia Newton-John issue de la bande originale du film Xanadu, connue pour son ambiance douce et son refrain envoûtant."
},
{
  "title": "Casser la voix",
  "artist": "Patrick Bruel",
  "year": 1989,
  "audio_path": "hits/ae40e110-8b37-41dd-9153-61b11d7968bc.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Patrick Bruel, connue pour son refrain poignant et son émotion intense, qui a marqué les années 1980 en France."
},
{
  "title": "Glory of Love",
  "artist": "Peter Cetera",
  "year": 1986,
  "audio_path": "hits/e3e3d25c-6b44-4f07-ad0f-c9bc8134621b.mp3",
  "isGroup": false,
  "desc": "Ballade emblématique de Peter Cetera, célèbre pour son refrain romantique et sa puissance émotionnelle, issue de la bande originale du film 'The Karate Kid II'."
},
{
  "title": "In the Air Tonight",
  "artist": "Phil Collins",
  "year": 1981,
  audio_path: "hits/4db576a0-bc57-43aa-a4d3-749f544b79e4.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Phil Collins mêlant rock et atmosphère sombre, célèbre pour sa montée progressive et son mythique break de batterie."
},
{
  "title": "Another Brick in the Wall (Part II)",
  "artist": "Pink Floyd",
  "year": 1979,
  audio_path: "hits/6e8c9331-ad13-46ed-a566-e76ab36fc0ae.mp3",
  "isGroup": true,
  "desc": "Tube emblématique de Pink Floyd mêlant rock progressif et disco, célèbre pour son refrain « We don’t need no education » et sa critique du système scolaire."
},
{
  "title": "Pour le plaisir",
  "artist": "Herbert Léonard",
  "year": 1981,
  "audio_path": "hits/28d7ad8f-a104-4d7b-8683-3c594f3f1e51.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Herbert Léonard, mélodieuse et romantique, symbole de la variété française des années 80."
},
{
  "title": "Purple Rain",
  "artist": "Prince",
  "year": 1984,
  "audio_path": "hits/fe923c2f-e833-40db-8c8b-2d4df29375e1.mp3",
  "isGroup": false,
  "desc": "Ballade emblématique mêlant rock et pop, célèbre pour sa puissance émotionnelle et son solo de guitare inoubliable."
},
{
  "title": "Crazy Little Thing Called Love",
  "artist": "Queen",
  "year": 1979,
  "audio_path": "hits/2e474388-ac23-46ae-b333-818cd36c8b95.mp3",
  "isGroup": true,
  "desc": "Chanson rockabilly de Queen, avec un rythme entraînant et un style rétro, portée par Freddie Mercury."
},
{
  "title": "Ghostbusters",
  "artist": "Ray Parker Jr.",
  "year": 1984,
  "audio_path": "hits/51151695-1b78-499d-a2a1-93a9087197f1.mp3",
  "isGroup": false,
  "desc": "Chanson culte de Ray Parker Jr. créée pour le film Ghostbusters, célèbre pour son rythme entraînant et son refrain \"Who you gonna call? Ghostbusters!\"."
},
{
  "title": "Morgane de toi",
  "artist": "Renaud",
  "year": 1983,
  "audio_path": "hits/527f6643-8888-4b10-a2e6-bcc6178c03e3.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Renaud, tendre et pleine d’humour, écrite pour sa fille Lolita. Elle mêle poésie, amour paternel et le style populaire caractéristique du chanteur."
},
{
  "title": "Never Gonna Give You Up",
  "artist": "Rick Astley",
  "year": 1987,
  "audio_path": "hits/47b43236-5d61-477b-8e04-fe7b857f5b37.mp3",
  "isGroup": false,
  "desc": "Chanson emblématique de Rick Astley, symbole de la pop des années 80, célèbre pour son refrain mémorable et son rythme entraînant."
},
{
  "title": "Rock with You",
  "artist": "Michael Jackson",
  "year": 1979,
  "audio_path": "hits/1abd7f9e-6bb5-404e-846e-f691affa7fa9.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de Michael Jackson mêlant disco et soul, reconnu pour son groove irrésistible et sa voix légendaire."
},
{
  "title": "Escape (The Piña Colada Song)",
  "artist": "Rupert Holmes",
  "year": 1979,
  "audio_path": "hits/9af5c298-e242-4ad6-964d-82eb91d0a6ce.mp3",
  "isGroup": false,
  "desc": "Chanson pop légère et emblématique de Rupert Holmes, racontant une histoire amusante de romance et de coïncidences amoureuses."
},
{
  "title": "Don't You (Forget About Me)",
  "artist": "Simple Minds",
  "year": 1985,
  "audio_path": "hits/189c6c33-86f5-4ac5-a23f-78eb1266646d.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Simple Minds, célèbre pour son utilisation dans le film 'The Breakfast Club' et son refrain inoubliable."
},
{
  "title": "Being with You",
  "artist": "Smokey Robinson",
  "year": 1981,
  "audio_path": "hits/3c3d51bf-781f-4d31-ada8-c9b3f7b9022b.mp3",
  "isGroup": false,
  "desc": "Hit emblématique de Smokey Robinson mêlant soul et R&B, célèbre pour sa voix suave et son refrain romantique."
},
{
  "title": "Tainted Love",
  "artist": "Soft Cell",
  "year": 1981,
  "audio_path": "hits/04407dc7-4825-4945-8c13-552c2251fbd9.mp3",
  "isGroup": true,
  "desc": "Hit emblématique de Soft Cell mêlant synthpop et new wave, célèbre pour son rythme entraînant et sa voix distinctive."
}
];

export default function ArtistOrBand() {
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
  const [isCorrectFlash, setIsCorrectFlash] = useState(false);
  const [completedThisGame, setCompletedThisGame] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Compter ce défi dans le compteur global
  useEffect(() => {
    if (!user || !gameOver || completedThisGame) return;

    const key = `completed_challenges_${user.id}`;
    const saved = localStorage.getItem(key);
    const currentCount = saved ? parseInt(saved, 10) : 0;
    const newCount = currentCount + 1;

    localStorage.setItem(key, newCount);
    setCompletedThisGame(true);
  }, [gameOver, user, completedThisGame]);

  // Préparer les questions
  useEffect(() => {
    const shuffled = artistData.sort(() => 0.5 - Math.random()).slice(0, NB_QUESTIONS);
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
    alert("Son activé ! Clique sur 'Jouer l'extrait (5s)' pour commencer.");
  };

  const playExcerpt = () => {
    const current = questions[currentIndex];
    if (!current?.audio_path) return;

    const url = getPublicUrl('audio', current.audio_path);
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

    const correct = questions[currentIndex].isGroup;
    const userAnswer = answer === 'GROUPE';

    if (userAnswer === correct) {
      const timeBonus = Math.floor(timeLeft * 12);
      setScore(prev => prev + 120 + timeBonus);

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

  if (loading) return <div className="text-center py-40 text-3xl animate-pulse">Préparation du Artiste ou Groupe ?...</div>;

  if (questions.length < NB_QUESTIONS) {
    return (
      <div className="text-center py-40 text-2xl text-red-400">
        Pas assez de hits pour lancer le jeu.
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-6xl font-bold neon-text mb-12 animate-pulse-slow">
          Artiste ou Groupe ? terminé !
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
        Artiste ou Groupe ?
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
          {timeLeft > 0 ? `${timeLeft} secondes restantes` : 'Choisis ta réponse pour lancer le chrono !'}
        </p>
      </div>

      {/* Question + extrait */}
      <div className="mb-12 p-8 bg-gray-900/60 rounded-2xl border border-neon-purple/40 text-2xl leading-relaxed">
        <p className="text-center mb-6">
          {current.title} de {current.artist} ({current.year}) est-il interprété par :
        </p>
        <p className="text-center text-lg text-neon-yellow italic">
          {current.desc}
        </p>
      </div>

      {/* Choix SOLO / GROUPE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
        <button
          onClick={() => {
            handleAnswer('SOLO');
            startTimer();
          }}
          disabled={showResult || !audioUnlocked}
          className={`p-10 rounded-2xl text-4xl font-bold transition-all duration-300 transform hover:scale-110 ${
            showResult
              ? !current.isGroup
                ? 'bg-green-600 scale-110 shadow-[0_0_40px_rgba(0,255,0,0.6)]'
                : selectedAnswer === 'SOLO'
                ? 'bg-red-600 scale-95'
                : 'bg-gray-800 opacity-60'
              : 'bg-gradient-to-br from-blue-600/40 to-indigo-700/40 hover:from-blue-500 hover:to-indigo-600 border border-blue-500/50'
          }`}
        >
          SOLO
        </button>

        <button
          onClick={() => {
            handleAnswer('GROUPE');
            startTimer();
          }}
          disabled={showResult || !audioUnlocked}
          className={`p-10 rounded-2xl text-4xl font-bold transition-all duration-300 transform hover:scale-110 ${
            showResult
              ? current.isGroup
                ? 'bg-green-600 scale-110 shadow-[0_0_40px_rgba(0,255,0,0.6)]'
                : selectedAnswer === 'GROUPE'
                ? 'bg-red-600 scale-95'
                : 'bg-gray-800 opacity-60'
              : 'bg-gradient-to-br from-purple-600/40 to-pink-700/40 hover:from-purple-500 hover:to-pink-600 border border-purple-500/50'
          }`}
        >
          GROUPE
        </button>
      </div>

      {/* Résultat */}
      {showResult && (
        <div className="mt-8 animate-fade-in">
          <p className="text-3xl md:text-4xl font-bold mb-8 neon-text">
            {selectedAnswer === (current.isGroup ? 'GROUPE' : 'SOLO')
              ? `✓ OUI ! +${120 + Math.floor(timeLeft * 12)} pts`
              : `✗ C’était ${current.isGroup ? 'un GROUPE' : 'un ARTISTE SOLO'} – ${current.title} de ${current.artist}`}
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