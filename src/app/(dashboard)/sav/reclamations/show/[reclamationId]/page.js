import ViewReclamation from './ViewReclamation'

export default function Page({ params }) {
  const { reclamationId } = params
  return <ViewReclamation reclamationId={reclamationId} />
}
