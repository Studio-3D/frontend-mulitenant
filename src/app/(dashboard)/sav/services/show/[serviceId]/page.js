import ViewService from './ViewService'

export default function Page({ params }) {
  const { serviceId } = params
  return <ViewService serviceId={serviceId} />
}
