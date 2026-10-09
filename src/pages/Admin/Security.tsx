import ModuleUnavailable from './ModuleUnavailable'

export default function AdminSecurity() {
  return (
    <ModuleUnavailable
      description="Surveillez les tentatives de connexion et les sessions administrateur."
      requiredContract="Routes d’administration pour les connexions échouées, les sessions actives et le blocage d’adresse IP."
      title="Sécurité"
    />
  )
}
