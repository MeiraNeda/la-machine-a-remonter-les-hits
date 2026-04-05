// src/components/Timeline.jsx
import { motion } from 'framer-motion';

export default function Timeline({ events = [] }) {
  if (!events?.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-xl">
        Pas encore de chronologie pour ce tube...
      </div>
    );
  }

  return (
    <div className="py-12">
      <h2 className="text-4xl font-bold neon-text text-center mb-12">
        Naissance du tube – Timeline
      </h2>

      {/* Version mobile : verticale */}
      <div className="block md:hidden space-y-12 px-4">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative pl-12 border-l-4 border-neon-pink/50"
          >
            {/* Point sur la ligne */}
            <div className="absolute left-[-10px] top-1 w-5 h-5 rounded-full bg-neon-pink border-4 border-black shadow-[0_0_15px_rgba(255,0,255,0.7)]" />

            <div className="bg-gray-900/70 p-6 rounded-xl border border-neon-blue/40 hover:border-neon-blue transition-all">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-2xl">{event.icon || '★'}</span>
                <div>
                  <h3 className="text-xl font-bold text-neon-green">
                    {event.year}
                    {event.month && ` / ${String(event.month).padStart(2, '0')}`}
                  </h3>
                  <p className="text-sm text-gray-400">{event.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Version desktop : horizontale avec scroll */}
      <div className="hidden md:block overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-neon-pink scrollbar-track-gray-900">
        <div className="inline-flex gap-16 px-8 min-w-max">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="relative flex flex-col items-center w-80 text-center"
            >
              {/* Ligne de connexion */}
              {index < events.length - 1 && (
                <div className="absolute top-10 left-[50%] w-[calc(100%+4rem)] h-1 bg-gradient-to-r from-neon-blue to-neon-pink opacity-60" />
              )}

              {/* Point / Icône */}
              <div className="relative z-10 mb-6">
                <div className="w-20 h-20 rounded-full bg-black border-4 border-neon-pink flex items-center justify-center shadow-[0_0_25px_rgba(255,0,255,0.6)]">
                  <span className="text-4xl">{event.icon || '★'}</span>
                </div>
              </div>

              {/* Carte événement */}
              <div className="bg-gray-900/80 p-6 rounded-2xl border border-neon-blue/50 hover:border-neon-pink hover:shadow-[0_0_30px_rgba(255,0,255,0.4)] transition-all w-full">
                <h3 className="text-2xl font-bold text-neon-green mb-2">
                  {event.year}
                  {event.month && ` – ${String(event.month).padStart(2, '0')}`}
                </h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-8 md:mt-4">
        ← Fais défiler horizontalement sur ordinateur →
      </p>
    </div>
  );
}