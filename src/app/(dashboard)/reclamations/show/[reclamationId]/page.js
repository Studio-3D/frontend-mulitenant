import ReclamationFullPage from './detailRec'

export default function Page({ params }) {
  const { reclamationId } = params
  return <ReclamationFullPage reclamationId={reclamationId} />
}
