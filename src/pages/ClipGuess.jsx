// src/pages/ClipGuess.jsx
import { useState, useEffect, useRef } from 'react';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUIZ_DURATION = 12;
const AUDIO_PLAY_TIME = 5;
const INTRO_START_TIME = 45;
const NB_QUESTIONS = 8;

// Données statiques pour le jeu (hadClip: true = clip officiel 80s, false = non)
// À enrichir avec tes vrais hits + champ `had_official_video` dans ta base plus tard
const clipData = [
  {
  title: "Amoureux solitaires",
  artist: "Lio",
  year: 1980,
  audio_path: "hits/8d7b280b-3e53-439a-87df-a43426da3c3e.mp3",
  hadClip: true,
  desc: "Tube new wave écrit par Elli Medeiros et Jacno, célèbre pour son clip à l’esthétique rotoscope."
},
{
  title: "Banana Split",
  artist: "Lio",
  year: 1979,
  audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3",
  hadClip: true,
  desc: "Premier grand succès de Lio, chanson pop malicieusement ambiguë devenue un classique des années 80."
},
{
  title: "Il jouait du piano debout",
  artist: "France Gall",
  year: 1980,
  audio_path: "hits/7108c43f-9bee-4944-9df6-797f4c734652.mp3",
  hadClip: true,
  desc: "Chanson écrite par Michel Berger sur un musicien marginal qui reste libre et fidèle à lui-même."
},
{
  title: "Le coup de soleil",
  artist: "Richard Cocciante",
  year: 1979,
  audio_path: "hits/d4f39ed5-887c-454b-b43a-05a09cf2214b.mp3",
  hadClip: true,
  desc: "Ballade intense popularisée par le film 'Les Bronzés', évoquant un amour soudain et brûlant."
},
{
  title: "L'encre de tes yeux",
  artist: "Francis Cabrel",
  year: 1980,
  audio_path: "hits/e83b24b8-66e9-4c7c-b796-0e4464ded8da.mp3",
  hadClip: true,
  desc: "Chanson poétique et intimiste devenue l’un des titres emblématiques de Francis Cabrel."
},
{
  title: "Antisocial",
  artist: "Trust",
  year: 1980,
  audio_path: "hits/67f0e6ad-da3d-4170-ae98-535fcf56a4e3.mp3",
  hadClip: true,
  desc: "Classique du hard rock français dénonçant la pression du travail et la société de consommation, devenu l’un des hymnes du groupe Trust."
},
{
  title: "L’Aventurier",
  artist: "Indochine",
  year: 1982,
  audio_path: "hits/2df829ac-2b0a-4b29-93cb-07038d446cee.mp3",
  hadClip: true,
  desc: "Premier grand succès du groupe Indochine, mêlant new wave et rock français, racontant les aventures d’un héros inspiré des romans d’aventure et des bandes dessinées."
},
{
  title: "Les Démons de Minuit",
  artist: "Images",
  year: 1986,
  audio_path: "hits/4fc2a174-2097-4daf-a65f-b1352f53e349.mp3",
  hadClip: true,
  desc: "Chanson emblématique du groupe Images, mélangeant pop et disco française, qui raconte une histoire de passion et de séduction nocturne."
},
{
  title: "Billie Jean",
  artist: "Michael Jackson",
  year: 1982,
  audio_path: "hits/bc5a3a5f-035f-4a25-83c5-049cbb4ad2bc.mp3",
  hadClip: true,
  desc: "Un des plus grands tubes de Michael Jackson, issu de l’album Thriller, racontant l’histoire d’une femme accusant le chanteur d’être le père de son enfant, avec une ligne de basse emblématique."
},
{
  title: "Thriller",
  artist: "Michael Jackson",
  year: 1982,
  audio_path: "hits/622ba1ae-bacc-47d6-98ca-cda438a054be.mp3",
  hadClip: true,
  desc: "Hymne mondial du pop et du funk, célèbre pour son clip révolutionnaire et son ambiance horrifique, devenu un classique incontournable de Michael Jackson."
},
{
  title: "Africa",
  artist: "Toto",
  year: 1982,
  audio_path: "9fe71d83-d973-4ec9-a8ce-16d45a43dd8e.mp3",
  hadClip: true,
  desc: "Tube mondial du groupe Toto, mélange de rock et de pop avec des influences africaines dans le rythme et les harmonies, devenu un classique des années 80."
},
{
  title: "Like a Virgin",
  artist: "Madonna",
  year: 1984,
  audio_path: "hits/d383e6f2-8d0e-445f-a14d-0ed0853c2454.mp3",
  hadClip: true,
  desc: "Hit emblématique de Madonna qui a marqué les années 80, mélangeant pop et dance, et devenu un symbole de provocation et d’affirmation de la féminité dans la culture populaire."
},
{
  title: "Take On Me",
  artist: "a-ha",
  year: 1985,
  audio_path: "hits/dfafa623-41ea-42eb-b601-ab9b3e463b1c.mp3",
  hadClip: true,
  desc: "Hit emblématique du groupe norvégien a-ha, mêlant synth-pop et new wave, célèbre pour son clip innovant combinant animation et live-action, et sa ligne de synthé mémorable."
},
{
  title: "Last Christmas",
  artist: "Wham!",
  year: 1984,
  audio_path: "hits/d3db4d04-1be3-465e-ba1e-d7d5e3fbd43f.mp3",
  hadClip: true,
  desc: "Tube pop incontournable des années 80, racontant une histoire de cœur brisé pendant les fêtes de Noël, devenu un classique incontournable de Noël dans le monde entier."
},
{
  title: "99 Luftballons",
  artist: "Nena",
  year: 1983,
  audio_path: "eac78863-1210-4074-ab1e-8fcbfbee4be2.mp3",
  hadClip: true,
  desc: "Tube emblématique de la new wave allemande des années 80, la chanson raconte de façon symbolique comment 99 ballons déclenchent par erreur une guerre, devenant un message pacifiste marquant de la Guerre froide."
},
{
  title: "Rock Me Amadeus",
  artist: "Falco",
  year: 1985,
  audio_path: "hits/3282c69a-444f-40ae-8a15-cc2a8252343f.mp3",
  hadClip: true,
  desc: "Tube international du chanteur autrichien Falco, mêlant pop, rap et synthpop, rendant hommage de façon moderne et décalée au compositeur Wolfgang Amadeus Mozart."
},
{
  title: "Lambada",
  artist: "Kaoma",
  year: 1989,
  audio_path: "hits/96abf6da-8d00-4512-93f4-af419db8e8bc.mp3",
  hadClip: true,
  desc: "Tube mondial du groupe franco-brésilien Kaoma, célèbre pour sa danse sensuelle et son mélange de rythmes brésiliens et pop internationale, devenu un symbole des années 80."
},
{
  title: "Les Lacs du Connemara",
  artist: "Michel Sardou",
  year: 1981,
  audio_path: "hits/06518c2c-0ecf-497f-8239-72355fb5483f.mp3",
  hadClip: true,
  desc: "Énorme succès de Michel Sardou, chanson épique racontant les paysages et légendes de l’Irlande, devenue un incontournable du répertoire français et un classique des fêtes et spectacles."
},
{
  title: "Partenaire Particulier",
  artist: "Partenaire Particulier",
  year: 1984,
  audio_path: "hits/756132bb-9c6d-40c1-ac2c-55de2dc35145.mp3",
  hadClip: true,
  desc: "Tube emblématique de la scène synthpop française des années 80, mélangeant funk et new wave, racontant les histoires d’amour et de séduction à travers des sonorités dansantes et modernes pour l’époque."
},
{
  title: "Elle",
  artist: "Didier Barbelivien",
  year: 1985,
  audio_path: "hits/2530d9a3-01b4-48c1-af76-8a6ec848c961.mp3",
  hadClip: true,
  desc: "Ballade romantique emblématique de Didier Barbelivien, racontant l’histoire d’un amour idéalisé et d’une femme inoubliable, très populaire dans les années 1980."
},
{
  title: "En rouge et noir",
  artist: "Jeanne Mas",
  year: 1986,
  audio_path: "hits/0c12cb4d-9d8e-4f1f-b4b2-33c6fc1a283c.mp3",
  hadClip: true,
  desc: "Grand succès de la chanteuse française Jeanne Mas, symbole des années 80, mélangeant synthpop et new wave, évoquant la passion et la dualité entre amour et pouvoir."
},
{
  title: "Macumba",
  artist: "Jean-Pierre Mader",
  year: 1984,
  audio_path: "hits/6fa0489c-4651-46d9-a449-cda82bd5e59d.mp3",
  hadClip: true,
  desc: "Succès emblématique des années 80 en France, chanson pop/dance entraînante de Jean‑Pierre Mader qui invite à danser sur un rythme exotique et festif."
},
{
  title: "Africa",
  artist: "Rose Laurens",
  year: 1982,
  audio_path: "hits/c9b5eaef-a2a6-4e43-a144-2894a47e93d4.mp3",
  hadClip: true,
  desc: "Succès planétaire de Rose Laurens mêlant pop et sonorités africaines, connu pour son refrain accrocheur et devenu un classique des années 80 en France et à l’international."
},
{
  title: "Un autre monde",
  artist: "Téléphone",
  year: 1984,
  audio_path: "hits/20e4dfa9-d7fc-4375-88cd-297ee6396faf.mp3",
  hadClip: true,
  desc: "Titre emblématique du groupe Téléphone, mêlant rock français et mélodie accrocheuse, évoquant le rêve d’un monde meilleur et l’évasion de la routine quotidienne."
},
{
  title: "Marcia Baïla",
  artist: "Les Rita Mitsouko",
  year: 1984,
  audio_path: "hits/1bcd61d6-dbfc-461a-a32f-d02d878b5435.mp3",
  hadClip: true,
  desc: "Hymne pop-rock du duo français Les Rita Mitsouko, mélangeant new wave et influences latines, célébrant la danse et rendant hommage à Marcia Moretto, danseuse et amie du groupe."
},
{
  title: "Vertige de l’amour",
  artist: "Alain Bashung",
  year: 1981,
  audio_path: "hits/a4dea949-fd5a-4ebc-8446-176a7dc3e74e.mp3",
  hadClip: true,
  desc: "Tube incontournable d’Alain Bashung mêlant rock et new wave, marqué par ses paroles décalées et son énergie unique, devenu l’un des grands classiques de la chanson française des années 80."
},
{
  title: "Nuit de folie",
  artist: "Début de Soirée",
  year: 1986,
  audio_path: "hits/5dee755b-c23c-4e81-9007-7dd4639d3fb9.mp3",
  hadClip: true,
  desc: "Immense tube de la pop française des années 80, célèbre pour son refrain festif et son ambiance disco. La chanson évoque une nuit de fête et de danse devenue culte dans les soirées rétro."
},
{
  title: "Je te donne",
  artist: "Jean-Jacques Goldman & Michael Jones",
  year: 1985,
  audio_path: "hits/5ef9b7a8-bd03-4f89-9008-7d6817977e73.mp3",
  hadClip: true,
  desc: "Duet emblématique de Jean-Jacques Goldman et Michael Jones, symbole de fraternité et de partage, mêlant pop et rock français avec des paroles évoquant l’entraide et l’amitié."
},
{
  title: "Les Tzars",
  artist: "Indochine",
  year: 1986,
  audio_path: "hits/40544b0d-8ebe-4ee0-a7cd-417a68be7039.mp3",
  hadClip: true,
  desc: "Extrait de l’album '3', ce morceau d’Indochine mélange new wave et rock français, avec des paroles évoquant la nostalgie et les bouleversements politiques, renforcées par une atmosphère sombre et électrisante."
},
{
  title: "Miss Maggie",
  artist: "Renaud",
  year: 1985,
  audio_path: "hits/3fb2c206-549e-4823-b277-1b79efaf544d.mp3",
  hadClip: true,
  desc: "Chanson engagée de Renaud critiquant Margaret Thatcher et, plus largement, la violence et le pouvoir politique, tout en opposant cette image à celle des femmes qu’il décrit comme moins enclines à la brutalité."
},
{
  title: "Cendrillon",
  artist: "Téléphone",
  year: 1982,
  audio_path: "hits/57108368-1a8b-4dfa-b395-011f9b556b4e.mp3",
  hadClip: true,
  desc: "Grand classique du rock français du groupe Téléphone, racontant l’histoire tragique d’une jeune femme qui rêve de gloire et de liberté mais se perd dans les excès et la célébrité."
},
{
  title: "Tata Yoyo",
  artist: "Annie Cordy",
  year: 1980,
  audio_path: "hits/794e1c5c-b676-46c5-a13f-191643aea78b.mp3",
  hadClip: true,
  desc: "Chanson joyeuse et emblématique d’Annie Cordy, mélangeant humour et rythmes entraînants, devenue un incontournable du répertoire festif français."
},
{
  title: "Call Me",
  artist: "Blondie",
  year: 1980,
  audio_path: "hits/af845702-b51c-481c-8f3a-8dd92183e6b7.mp3",
  hadClip: true,
  desc: "Un tube emblématique du groupe Blondie mêlant new wave et rock, enregistré pour la bande originale du film *American Gigolo*, et devenu un hit international grâce à sa voix accrocheuse et son rythme entraînant."
},
{
  title: "Down Under",
  artist: "Men at Work",
  year: 1982,
  audio_path: "hits/bbbf5073-47a6-4f79-968e-c983ae73027b.mp3",
  hadClip: true,
  desc: "Tube international du groupe australien Men at Work, mêlant pop rock et sonorités de flûte caractéristiques, célébrant la culture australienne avec humour et devenu un classique des années 80."
},
{
  title: "Sweet Dreams (Are Made of This)",
  artist: "Eurythmics",
  year: 1983,
  audio_path: "hits/fa980b89-f5e6-4611-84c0-69eb3f6ee645.mp3",
  hadClip: true,
  desc: "Tube emblématique du duo britannique Eurythmics, mêlant synth-pop et new wave, avec un clip visuel et surréaliste devenu culte, et une ligne de synthé immédiatement reconnaissable."
},
{
  title: "Karma Chameleon",
  artist: "Culture Club",
  year: 1983,
  audio_path: "hits/ea0b58a7-dc9d-4c85-a9ac-96e1d0581d34.mp3",
  hadClip: true,
  desc: "Un des plus grands succès de Culture Club, mélangeant pop et new wave avec des influences reggae, racontant une histoire d’amour et de trahison avec un refrain mémorable."
},
{
  title: "Careless Whisper",
  artist: "George Michael",
  year: 1984,
  audio_path: "hits/2c6bf6e1-4f87-47f7-9230-4a2979e31eab.mp3",
  hadClip: true,
  desc: "Ballade emblématique mêlant pop et soul, célèbre pour son solo de saxophone inoubliable, racontant la culpabilité et le regret après une infidélité."
},
{
  title: "I Wanna Dance with Somebody",
  artist: "Whitney Houston",
  year: 1987,
  audio_path: "hits/ea05e389-3b48-46eb-a08a-93ed193b3670.mp3",
  hadClip: true,
  desc: "Hit planétaire de Whitney Houston, symbole de la pop des années 80, mélangeant énergie dance et émotions amoureuses, célébré pour son refrain entraînant et sa voix puissante."
},
{
  title: "Everybody Wants to Rule the World",
  artist: "Tears for Fears",
  year: 1985,
  audio_path: "hits/6e394bbc-d9cf-4109-8093-6ae011695b33.mp3",
  hadClip: true,
  desc: "Un classique du groupe britannique Tears for Fears, symbole de la new wave des années 80, abordant les thèmes du pouvoir, de l'ambition et de l'incertitude dans un monde en mutation."
},
{
  title: "Livin’ on a Prayer",
  artist: "Bon Jovi",
  year: 1986,
  audio_path: "hits/2872942a-ad46-41b8-b116-4499cd509b6a.mp3",
  hadClip: true,
  desc: "Tube emblématique de Bon Jovi, symbole du rock des années 80, racontant l’histoire d’un couple de travailleurs confronté aux difficultés de la vie, avec un refrain devenu légendaire."
},
{
  title: "Sweet Child o’ Mine",
  artist: "Guns N’ Roses",
  year: 1987,
  audio_path: "hits/66e9147e-b653-4139-9c11-5fe7e3a58f01.mp3",
  hadClip: true,
  desc: "Tube emblématique de Guns N’ Roses extrait de l’album Appetite for Destruction, célèbre pour son riff de guitare iconique et ses paroles dédiées à l’amour et à l’admiration."
},
{
  title: "Faith",
  artist: "George Michael",
  year: 1987,
  audio_path: "hits/244fe14d-78f3-4ff4-b487-bc35047c15f5.mp3",
  hadClip: true,
  desc: "Premier single solo de George Michael après Wham!, mêlant pop et rock, avec un riff de guitare accrocheur et un clip emblématique qui a marqué les années 80."
},
{
  title: "Like a Prayer",
  artist: "Madonna",
  year: 1989,
  audio_path: "hits/3b759142-8d0f-4ea7-baff-a6549a65064b.mp3",
  hadClip: true,
  desc: "Un des plus grands succès de Madonna, mêlant pop, gospel et thèmes religieux, célèbre pour son clip controversé et sa puissance émotionnelle, qui a marqué la fin des années 80."
},
{
  title: "Another Day in Paradise",
  artist: "Phil Collins",
  year: 1989,
  audio_path: "hits/c5f7e7df-51ce-42c3-8527-0799562fdf5c.mp3",
  hadClip: true,
  desc: "Ballade emblématique de Phil Collins dénonçant l’indifférence face aux sans-abris et aux difficultés sociales, alliant pop et soul avec une forte charge émotionnelle."
},
{
  title: "Don’t You Want Me",
  artist: "The Human League",
  year: 1981,
  audio_path: "hits/d1237eab-5f41-4102-a258-64c31a6a9716.mp3",
  hadClip: true,
  desc: "Grand classique de la synthpop britannique, racontant l’histoire d’une relation entre un homme ayant aidé une femme à réussir et celle-ci affirmant son indépendance."
},
{
  title: "Girls Just Want to Have Fun",
  artist: "Cyndi Lauper",
  year: 1983,
  audio_path: "hits/01149a41-0b21-4938-82ec-b07bbe23cff7.mp3",
  hadClip: true,
  desc: "Tube pop iconique des années 80 devenu un hymne à la liberté et à l’indépendance des femmes, porté par l’énergie et la voix unique de Cyndi Lauper."
},
{
  title: "Hungry Like the Wolf",
  artist: "Duran Duran",
  year: 1982,
  audio_path: "hits/ddabd912-e40d-4209-85bf-f878916263ff.mp3",
  hadClip: true,
  desc: "Un des tubes emblématiques de Duran Duran, mêlant new wave et rock synthétique, célèbre pour son clip tourné au Sri Lanka et son énergie entraînante."
},
{
  title: "Do You Really Want to Hurt Me",
  artist: "Culture Club",
  year: 1982,
  audio_path: "hits/f3f90e85-1254-4117-89a5-6af6936cbfb8.mp3",
  hadClip: true,
  desc: "Succès international du groupe Culture Club, mélangeant new wave et soul, abordant les thèmes de l’amour, de la douleur et de la vulnérabilité, porté par la voix unique de Boy George."
},
{
  title: "Wake Me Up Before You Go-Go",
  artist: "Wham!",
  year: 1984,
  audio_path: "hits/9738b19f-18db-46c9-8e72-8ebf7bded47f.mp3",
  hadClip: true,
  desc: "Tube pop énergique du duo britannique Wham!, devenu l’un des symboles des années 80 grâce à son rythme entraînant, son refrain accrocheur et son clip coloré emblématique de la culture pop de l’époque."
},
{
  title: "Radio Ga Ga",
  artist: "Queen",
  year: 1984,
  audio_path: "hits/488caa8b-8007-4532-8441-58fbcedee500.mp3",
  hadClip: true,
  desc: "Tube mondial du groupe Queen issu de l’album The Works, la chanson rend hommage à l’âge d’or de la radio tout en évoquant l’évolution des médias et de la musique."
},
{
  title: "867-5309/Jenny",
  artist: "Tommy Tutone",
  year: 1981,
  audio_path: "hits/4d7b5374-21c2-4997-adfc-6bfe190b6b8e.mp3",
  hadClip: true,
  desc: "Tube pop-rock des années 80 racontant l’histoire d’un numéro de téléphone trouvé sur un mur et la mystérieuse Jenny, devenu un classique incontournable de la culture pop américaine."
},
{
  title: "Goody Two Shoes",
  artist: "Adam Ant",
  year: 1982,
  audio_path: "hits/e74d340f-5019-46dd-bc19-db21d15ed219.mp3",
  hadClip: true,
  desc: "Tube new wave d’Adam Ant au ton satirique, se moquant de la presse people et de l’obsession des médias pour la vie privée des célébrités."
},
{
  title: "The Sun Always Shines on T.V.",
  artist: "a-ha",
  year: 1985,
  audio_path: "hits/e1a3ff62-2610-4535-ac0f-bc2a037b427b.mp3",
  hadClip: true,
  desc: "Second grand succès du groupe norvégien a-ha après Take On Me, cette chanson new wave mêle synthétiseurs puissants et voix dramatique pour évoquer le décalage entre les rêves médiatiques et la réalité."
},
{
  title: "Cruel Summer",
  artist: "Bananarama",
  year: 1983,
  audio_path: "hits/2eb3569d-c330-4428-be59-6fa6bbaa8cd7.mp3",
  hadClip: true,
  desc: "Tube emblématique du groupe britannique Bananarama, mélangeant pop et new wave, évoquant la mélancolie et la chaleur d’un été difficile."
},
{
  title: "Do They Know It’s Christmas?",
  artist: "Band Aid",
  year: 1984,
  audio_path: "hits/02377727-7872-4026-8680-ee1ae8847aa8.mp3",
  hadClip: true,
  desc: "Single caritatif enregistré par le collectif Band Aid pour récolter des fonds contre la famine en Éthiopie. Réunissant de nombreuses stars britanniques des années 80, la chanson est devenue un classique de Noël et un symbole de mobilisation humanitaire dans la musique."
},
{
  title: "Woman in Love",
  artist: "Barbra Streisand",
  year: 1980,
  audio_path: "hits/f2dede43-10b9-46d2-9cde-91250e82601b.mp3",
  hadClip: true,
  desc: "Ballade pop écrite par les Bee Gees pour Barbra Streisand, devenue l’un de ses plus grands succès internationaux grâce à sa mélodie romantique et sa performance vocale puissante."
},
{
  title: "It’s Still Rock and Roll to Me",
  artist: "Billy Joel",
  year: 1980,
  audio_path: "hits/dbd67a41-450e-4ae9-a59d-5754ea56926b.mp3",
  hadClip: true,
  desc: "Hit de Billy Joel mêlant rock et new wave, qui critique les changements de mode et les tendances musicales, affirmant que le rock reste intemporel."
},
{
  title: "Uptown Girl",
  artist: "Billy Joel",
  year: 1983,
  audio_path: "hits/ff44fe6c-34c6-48f3-b76d-3d0153a19587.mp3",
  hadClip: true,
  desc: "Un hit pop-rock emblématique de Billy Joel, racontant l’histoire d’un homme amoureux d’une jeune femme de la haute société, avec un style inspiré des années 60."
},
{
  title: "Ride on Time",
  artist: "Black Box",
  year: 1989,
  audio_path: "hits/26fda3c1-fa81-4d82-928c-1fb7b5957e28.mp3",
  hadClip: true,
  desc: "Tube emblématique de la house italienne, combinant samples vocaux puissants et rythmes dansants, qui a marqué la fin des années 1980 et reste un classique des clubs."
},
{
  title: "The Tide Is High",
  artist: "Blondie",
  year: 1980,
  audio_path: "hits/fe3d9678-3175-49c8-842c-d936526627d5.mp3",
  hadClip: true,
  desc: "Reprise du tube jamaïcain de 1967 par Blondie, mêlant new wave et reggae, qui raconte l’histoire d’une femme prête à tout pour conquérir l’amour de son partenaire."
},
{
  title: "My Prerogative",
  artist: "Bobby Brown",
  year: 1988,
  audio_path: "hits/4adf2cdc-4393-415a-b939-01b7f9783f7d.mp3",
  hadClip: true,
  desc: "Grand succès de Bobby Brown mêlant new jack swing, R&B et pop, affirmant le droit de vivre sa vie comme on l’entend face aux critiques et aux jugements."
},
{
  title: "Do That to Me One More Time",
  artist: "Captain & Tennille",
  year: 1979,
  audio_path: "hits/472a232d-6585-414b-901c-72609405b82f.mp3",
  hadClip: true,
  desc: "Ballade pop romantique du duo Captain & Tennille devenue un grand succès à la fin des années 1970, connue pour son ambiance douce et sa mélodie emblématique."
},
{
  title: "Cherchez le garçon",
  artist: "Taxi Girl",
  year: 1980,
  audio_path: "hits/edc4b91d-46bb-439f-b83e-5bba43ff6151.mp3",
  hadClip: true,
  desc: "Tube emblématique du groupe new wave français Taxi Girl, mêlant synth-pop et atmosphère sombre, racontant l’histoire d’une quête amoureuse urbaine."
},
{
  title: "Look Away",
  artist: "Chicago",
  year: 1988,
  audio_path: "hits/cf63535b-6819-4339-90a9-2902282824e6.mp3",
  hadClip: true,
  desc: "Ballade rock du groupe Chicago sortie à la fin des années 1980, écrite par Diane Warren. La chanson parle d’une rupture difficile et est devenue l’un des plus grands succès du groupe."
},
{
  title: "Sailing",
  artist: "Christopher Cross",
  year: 1980,
  audio_path: "hits/edab91b1-d1f7-4546-8e1e-c4c873f91ba0.mp3",
  hadClip: true,
  desc: "Ballade soft rock emblématique de Christopher Cross, célèbre pour son ambiance douce et maritime, devenue un grand succès international et récompensée aux Grammy Awards."
},
{
  title: "Coming Up (Live at Glasgow)",
  artist: "Paul McCartney",
  year: 1980,
  audio_path: "hits/b2731f2e-fa51-45b8-826b-e939e39421b9.mp3",
  hadClip: true,
  desc: "Version live du tube de Paul McCartney, enregistré à Glasgow, mêlant pop-rock entraînante et énergie scénique, montrant la virtuosité du musicien après l’ère Beatles."
},
{
  title: "Enjoy the Silence",
  artist: "Depeche Mode",
  year: 1990,
  audio_path: "hits/e95fb79a-f16c-4097-a8f5-533c236da326.mp3",
  hadClip: true,
  desc: "Un des plus grands succès de Depeche Mode, mélangeant synth-pop et new wave, sur le thème de la puissance des mots et du besoin de silence dans les relations."
},
{
  title: "Come On Eileen",
  artist: "Dexys Midnight Runners",
  year: 1982,
  audio_path: "hits/4f63ec47-aa8f-498d-b1da-8d711fc6dfe6.mp3",
  hadClip: true,
  desc: "Hymne pop-rock des années 80, ce tube de Dexys Midnight Runners mêle folk, soul et énergie irrésistible, racontant une histoire d’amour adolescente et de nostalgie."
},
{
  title: "That’s What Friends Are For",
  artist: "Dionne Warwick",
  year: 1985,
  audio_path: "hits/73363726-26f2-48ad-9f00-0452522c4cf5.mp3",
  hadClip: true,
  desc: "Chanson emblématique de Dionne Warwick, interprétée avec Elton John, Gladys Knight et Stevie Wonder, célébrant l’amitié et la solidarité, et devenue un succès international tout en soutenant la lutte contre le SIDA."
},
{
  title: "Ebony and Ivory",
  artist: "Paul McCartney & Stevie Wonder",
  year: 1982,
  audio_path: "hits/893a5a1b-760b-490a-a6f2-3ce5b7efd781.mp3",
  hadClip: true,
  desc: "Un duo marquant entre Paul McCartney et Stevie Wonder, sorti en 1982, qui utilise la métaphore des touches noires et blanches d’un piano pour promouvoir l’harmonie raciale et l’égalité, et qui a été un immense succès international."
},
{
  title: "Week-end à Rome",
  artist: "Étienne Daho",
  year: 1984,
  audio_path: "hits/633a627d-bb84-47da-b719-851f1109de83.mp3",
  hadClip: true,
  desc: "Chanson emblématique de la new wave française, mêlant pop et synthétiseurs, qui raconte une escapade romantique à Rome, et a contribué à faire connaître Étienne Daho au grand public."
},
{
  title: "Der Kommissar",
  artist: "Falco",
  year: 1981,
  audio_path: "hits/def51103-9e33-4fe0-921e-d62445b54818.mp3",
  hadClip: true,
  desc: "Succès emblématique de Falco, mélangeant pop et new wave avec des paroles racontant une histoire policière urbaine, qui a propulsé l’artiste autrichien sur la scène internationale."
},
{
  title: "Relax",
  artist: "Frankie Goes To Hollywood",
  year: 1983,
  audio_path: "hits/d314e3f9-f0d0-4042-b3c4-6f7195c5bb36.mp3",
  hadClip: true,
  desc: "Tube provocateur du groupe britannique Frankie Goes To Hollywood, devenu un symbole de la pop des années 80. La chanson a marqué les esprits par son énergie synthpop et sa controverse après avoir été censurée par la BBC."
},
{
  title: "Two Tribes",
  artist: "Frankie Goes To Hollywood",
  year: 1984,
  audio_path: "hits/32a649cb-889f-4b9a-b016-e705983fe988.mp3",
  hadClip: true,
  desc: "Tube new wave emblématique des années 80 dénonçant les tensions de la Guerre froide et la menace nucléaire, connu pour son énergie électro-rock et son clip satirique mettant en scène des dirigeants mondiaux."
},
{
  title: "One More Try",
  artist: "George Michael",
  year: 1987,
  audio_path: "hits/a6ceaba0-cb0c-45e8-9e96-33ea34ef8f5a.mp3",
  hadClip: true,
  desc: "Ballade soul emblématique de George Michael, issue de l’album Faith, exprimant la douleur et la vulnérabilité face à l’amour perdu, avec une émotion intense et une voix puissante."
},
{
  title: "Plus près des étoiles",
  artist: "Gold",
  year: 1985,
  audio_path: "hits/cfcb6edd-5f1e-41c2-bd81-9feafba40fe7.mp3",
  hadClip: true,
  desc: "Grand succès du groupe Gold, symbole de la pop française des années 80, évoquant l’espoir et le rêve avec une mélodie entraînante et des paroles poétiques."
},
{
  title: "Hard to Say I’m Sorry",
  artist: "Chicago",
  year: 1982,
  audio_path: "hits/a162d02f-d4ae-4862-8ddc-7d59e3570769.mp3",
  hadClip: true,
  desc: "Ballade pop rock emblématique du groupe Chicago, mêlant piano et harmonies vocales, racontant les regrets et les excuses dans une relation amoureuse."
},
{
  title: "Fame",
  artist: "Irene Cara",
  year: 1980,
  audio_path: "hits/a44d7f2f-5547-445d-9a55-ea9edbc85175.mp3",
  hadClip: true,
  desc: "Chanson phare du film Fame, interprétée par Irene Cara, devenue un hymne pop des années 80 célébrant le rêve de célébrité, le talent et la persévérance dans le monde du spectacle."
},
{
  title: "Tombé du ciel",
  artist: "Jacques Higelin",
  year: 1988,
  audio_path: "hits/c14d9e6b-84cf-4ffb-85be-3085f5094b97.mp3",
  hadClip: true,
  desc: "Chanson emblématique de Jacques Higelin, mêlant rock et chanson française, racontant avec poésie la légèreté et les rêves de liberté de l'existence."
},
{
  title: "Nasty",
  artist: "Janet Jackson",
  year: 1986,
  audio_path: "hits/496a72ea-52cf-4446-aa32-adcf7beccfc7.mp3",
  hadClip: true,
  desc: "Hit emblématique de Janet Jackson issu de l’album Control, dénonçant les comportements irrespectueux et affirmant l’indépendance et la force des femmes, avec un style funk et R&B puissant."
},
{
  title: "Comme toi",
  artist: "Jean-Jacques Goldman",
  year: 1983,
  audio_path: "hits/ad0ff03c-7740-4795-9dee-583ce6d5f0a4.mp3",
  hadClip: true,
  desc: "Chanson émouvante de Jean-Jacques Goldman racontant l’histoire d’une petite fille juive pendant la Seconde Guerre mondiale, évoquant l’innocence perdue et la mémoire de l’Holocauste."
},
{
  title: "The Power of Love",
  artist: "Jennifer Rush",
  year: 1984,
  audio_path: "hits/d91596f7-1fd3-40e5-aa83-03276d47ca59.mp3",
  hadClip: true,
  desc: "Ballade puissante devenue l’un des plus grands succès de Jennifer Rush dans les années 80, célèbre pour sa montée vocale impressionnante et son thème sur la force de l’amour."
},
{
  title: "Don’t Stop Believin’",
  artist: "Journey",
  year: 1981,
  audio_path: "hits/dbb3285d-0613-4acc-8c09-96988cfc6a4f.mp3",
  hadClip: true,
  desc: "Hymne rock américain incontournable, ce titre de Journey raconte l’histoire d’espoir et de persévérance face aux difficultés de la vie, et est devenu un classique intergénérationnel."
},
{
  title: "Ève lève-toi",
  artist: "Julie Pietri",
  year: 1986,
  audio_path: "hits/eb819e61-affb-4dea-92a8-04913f4f92c8.mp3",
  hadClip: true,
  desc: "Grand succès de Julie Pietri dans les années 80, cette chanson pop française aborde le thème de l’émancipation féminine et reste un classique de la variété française."
}
];

export default function ClipGuess() {
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

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Préparer les questions
  useEffect(() => {
    const shuffled = [...clipData]
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
  };

  const playExcerpt = async () => {
    const current = questions[currentIndex];
    if (!current?.audio_path) {
      console.warn("Aucun audio_path pour cette question");
      return;
    }

    const url = getPublicUrl('audio', current.audio_path);

    console.log("🎵 === PLAY EXCERPT ===");
    console.log("Titre :", current.title);
    console.log("audio_path dans DB :", current.audio_path);
    console.log("URL générée :", url);

    if (!url) {
      console.error("getPublicUrl a retourné null");
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

      console.log("▶️ Tentative de lecture...");
      await audio.play();
      console.log("✅ Lecture démarrée avec succès !");

      setTimeout(() => {
        audio.pause();
        setIsPlaying(false);
        console.log("⏹️ Extrait arrêté automatiquement");
      }, AUDIO_PLAY_TIME * 1000);

    } catch (err) {
      console.error("❌ Erreur lors de audio.play() :", err.name, err.message);
      setIsPlaying(false);

      if (err.name === 'NotSupportedError') {
        console.error("Le fichier n'existe pas ou le bucket n'est pas public.");
      } else if (err.name === 'NotAllowedError') {
        console.error("Lecture bloquée par le navigateur (politique autoplay).");
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

  const handleAnswer = (answer) => {
    if (selectedAnswer || !audioUnlocked) return;

    setSelectedAnswer(answer);
    setShowResult(true);
    clearInterval(timerRef.current);

    const correct = questions[currentIndex].hadClip;
    if (answer === correct) {
      const timeBonus = Math.floor(timeLeft * 12);
      setScore(prev => prev + 150 + timeBonus);
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

  if (loading) return <div className="text-center py-40 text-3xl animate-pulse">Préparation du jeu...</div>;

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-6xl font-bold neon-text mb-12">Clip ou Pas Clip ? terminé !</h2>
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
    <div className="relative max-w-2xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10 tracking-wide">
        Clip ou Pas Clip ?
      </h2>

      <p className="text-3xl mb-8 font-extrabold">
        Question {currentIndex + 1} / {NB_QUESTIONS} – Score : <span className="text-neon-green">{score}</span>
      </p>

      <button
        onClick={audioUnlocked ? playExcerpt : unlockAudio}
        disabled={isPlaying}
        className={`mb-12 px-12 py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg transform hover:scale-105 ${
          isPlaying ? 'bg-gray-700 cursor-wait opacity-70' 
                    : audioUnlocked ? 'bg-neon-blue hover:bg-cyan-400' 
                    : 'bg-gradient-to-r from-neon-pink to-neon-green'
        }`}
      >
        {isPlaying ? 'Extrait en cours...' : audioUnlocked ? 'Jouer l\'extrait (5s)' : 'Activer le son & commencer'}
      </button>

      {/* Timer */}
      <div className="mb-12">
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-neon-blue/40">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue transition-all"
            style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xl font-semibold">
          {timeLeft > 0 ? `${timeLeft}s restantes` : 'Écoute puis réponds'}
        </p>
      </div>

      <div className="mb-12 p-8 bg-gray-900/60 rounded-2xl border border-neon-purple/40 text-2xl leading-relaxed">
        <p className="text-center mb-6">
          Ce tube de {current.artist} ({current.year}) avait-il un **clip vidéo officiel** dans les années 80 ?
        </p>
        <p className="text-lg text-neon-yellow italic text-center">{current.desc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <button
          onClick={() => { handleAnswer(true); startTimer(); }}
          disabled={showResult || !audioUnlocked}
          className={`p-10 rounded-2xl text-4xl font-bold transition-all hover:scale-110 ${
            showResult && current.hadClip ? 'bg-green-600 scale-110' : 
            showResult && selectedAnswer === true ? 'bg-red-600' : 
            'bg-gradient-to-br from-green-600/40 to-emerald-700/40 hover:from-green-500'
          }`}
        >
          VRAI
        </button>

        <button
          onClick={() => { handleAnswer(false); startTimer(); }}
          disabled={showResult || !audioUnlocked}
          className={`p-10 rounded-2xl text-4xl font-bold transition-all hover:scale-110 ${
            showResult && !current.hadClip ? 'bg-green-600 scale-110' : 
            showResult && selectedAnswer === false ? 'bg-red-600' : 
            'bg-gradient-to-br from-red-600/40 to-rose-700/40 hover:from-red-500'
          }`}
        >
          FAUX
        </button>
      </div>

      {showResult && (
        <div className="mt-10">
          <p className="text-3xl font-bold mb-8 neon-text">
            {selectedAnswer === current.hadClip ? `✓ Bonne réponse !` : `✗ Mauvaise réponse`}
          </p>
          <button
            onClick={nextQuestion}
            className="bg-gradient-to-r from-neon-pink to-purple-500 text-white font-bold py-6 px-16 rounded-2xl text-2xl"
          >
            Question suivante →
          </button>
        </div>
      )}
    </div>
  );
}