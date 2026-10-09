import ModuleUnavailable from './ModuleUnavailable'

export default function AdminSettings() {
  return (
    <ModuleUnavailable
      description="Gérez les paramètres globaux de la plateforme."
      requiredContract="Routes d’administration pour lire et modifier les paramètres, avec un schéma de données défini par le backend."
      title="Paramètres système"
    />
  )
}
