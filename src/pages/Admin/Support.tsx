import ModuleUnavailable from './ModuleUnavailable'

export default function AdminSupport() {
  return (
    <ModuleUnavailable
      description="Consultez les demandes d’assistance et suivez leur résolution."
      requiredContract="Routes paginées pour la liste et le détail des tickets, ainsi que des actions documentées d’assignation, résolution et clôture."
      title="Support et tickets"
    />
  )
}
