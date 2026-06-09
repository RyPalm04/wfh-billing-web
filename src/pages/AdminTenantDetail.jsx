import { useParams } from "react-router-dom"
import { useFetchData } from "../hooks/useFetchData"
import { getTenant, reactivateTenant, suspendTenant } from "../api/adminApi"
import { DetailRow } from "../components/DetailRow"
import { formatDate } from "../utils/date"
import logger from '../utils/logger'
import toast from "react-hot-toast"
import './AdminTenantDetail.css'


function AdminTenantDetail() {
    const { id } = useParams()
    const { data, loading, error, refresh } = useFetchData(() => getTenant(id).then(r => r.data))

    function handleSuspendTenant() {
        logger.debug('Suspending tenant...')
        suspendTenant(id).then(() => {
            toast.success('Tenant suspended')
            refresh()
        })
    }

    function handleReActivateTenant() {
        logger.debug('Re-Activating tenant...')
        reactivateTenant(id).then(() => {
            toast.success('Tenant re-activated')
            refresh()
        })
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Failed to load tenant</div>
    }

    const isAdmin = data.status === 'platform_manager'
    const isActive = data.status === 'active'

    return (
        <div className="page admin-tenant-detail">
            <div className="detail-card">
                <h1>Tenant Detail</h1>
                <DetailRow label="Tenant Name" value={data.name} />
                <DetailRow label="Tenant ID" value={data.id} />
                <DetailRow label="Status" value={data.status} />
                <DetailRow label="Created" value={formatDate(data.createdAt?.split('T')[0])} />
                <div className="detail-actions">
                    <button disabled={isAdmin} className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} onClick={isActive ? handleSuspendTenant : handleReActivateTenant}>
                        {isAdmin ? 'Admin Tenant' : isActive ? 'Suspend Tenant' : 'Re-Activate Tenant'}
                    </button>
                </div>
            </div>
        </div>
    )

}

export default AdminTenantDetail