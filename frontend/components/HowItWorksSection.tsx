export default function HowItWorksSection() {
  return (
    <section className="reveal-section grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-700 text-center hover:border-blue-400 transition-colors">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-white mb-2">
          1. Ajoute tes quêtes
        </h3>
        <p className="text-gray-400 text-sm">
          Vaisselle, sport, lecture... Transforme tes tâches en missions.
        </p>
      </div>
      <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-700 text-center hover:border-red-400 transition-colors">
        <div className="text-5xl mb-4">⚔️</div>
        <h3 className="text-xl font-bold text-white mb-2">2. Bats le Boss</h3>
        <p className="text-gray-400 text-sm">
          Choisis la difficulté de la tâche. Plus c'est dur, plus la récompense
          est grande.
        </p>
      </div>
      <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-700 text-center hover:border-yellow-400 transition-colors">
        <div className="text-5xl mb-4">💰</div>
        <h3 className="text-xl font-bold text-white mb-2">
          3. Monte en Niveau
        </h3>
        <p className="text-gray-400 text-sm">
          Gagne de l'XP et dépense ton or dans la boutique pour personnaliser
          ton héros.
        </p>
      </div>
    </section>
  );
}
