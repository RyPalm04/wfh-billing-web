import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../api/settingsApi'
import { useFetchData } from '../hooks/useFetchData'
import './Settings.css'
import toast from 'react-hot-toast'
import logger from '../utils/logger'
import { generateLicenseKey, getLicenseKey } from '../api/desktopApi'
import { FiClipboard, FiEye, FiEyeOff } from 'react-icons/fi'

function Settings() {
    const { data: settings, loading, error } = useFetchData(() => getSettings().then(r => r.data))
    const [savedSettings, setSavedSettings] = useState(null)
    const [formSettings, setFormSettings] = useState(null)
    const [errors, setErrors] = useState({})
    const [licenseKey, setLicenseKey] = useState(null)
    const [licenseKeyError, setLicenseKeyError] = useState(null)
    const [revealed, setRevealed] = useState(false)

    useEffect(() => {
        if (settings) {
            setSavedSettings(settings)
            setFormSettings(settings)
        }
    }, [settings])

    const isDirty = JSON.stringify(savedSettings) !== JSON.stringify(formSettings)

    function handleSave() {
        logger.debug("Saving settings:", formSettings)
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            logger.debug("Validation errors:", validationErrors)
            setErrors(validationErrors)
            return
        }
        setErrors({})

        updateSettings(formSettings)
            .then(() => {
                setSavedSettings(formSettings)
                toast.success("Settings saved")
            })
            .catch(() => { toast.error("Failed to save settings") })
    }

    useEffect(() => {
        getLicenseKey()
            .then(r => setLicenseKey(r.data.licenseKey))
            .catch(() => setLicenseKeyError(true))
    }, [])

    function handleGenerateKey() {
        generateLicenseKey()
            .then(r => {
                setLicenseKey(r.data.licenseKey)
                setLicenseKeyError(false)
                toast.success("Desktop access activated")
            })
            .catch(() => toast.error("Failed to activate desktop access"))
    }

    function validate() {
        logger.debug('Validating statement form with selected merchandise, special charges, and cash advances')
        const errors = {}

        if (formSettings.salesTaxRate < 0 || formSettings.salesTaxRate > 1) {
            logger.debug('Sales tax rate must be between 0 and 1. Current value:', formSettings.salesTaxRate)
            errors.salesTaxRate = "Sales tax rate must be between 0 and 1"
        }

        logger.debug('Validation completed with errors:', errors)
        return errors
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Failed to load settings</div>
    }

    return (
        <div className="page settings">
            <h1>Settings</h1>
            <div className="detail-card">
                <div className="form-field">
                    <label htmlFor="salesTaxRate">Sales Tax Rate</label>
                    <div className="input-with-suffix">
                        <input id="salesTaxRate" type="number" step="0.0001" min="0" max="1" value={formSettings?.salesTaxRate ?? '0.0000'} onChange={e => setFormSettings(prev => ({ ...prev, salesTaxRate: parseFloat(e.target.value) }))} />
                        <span className="input-suffix"> e.g. 0.0825 for 8.25%</span>
                    </div>
                    {errors.salesTaxRate && <span className="form-error">{errors.salesTaxRate}</span>}
                </div>
                <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSave} disabled={!isDirty}>
                        Save
                    </button>
                </div>
            </div>
            <div className="detail-card">
                <span className="detail-label">Desktop App</span>
                {licenseKeyError && <button className="btn btn-primary" onClick={handleGenerateKey}>Activate Desktop Access</button>}
                {licenseKey && (
                    <div className="license-key-display">
                        <span className={`license-key ${revealed ? '' : 'license-key--hidden'}`}>{licenseKey}</span>
                        <button className="btn btn-icon" onClick={() => setRevealed(prev => !prev)} title={revealed ? 'Hide' : 'Show'}>
                            {revealed ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                        <button className="btn btn-icon" title="Copy to clipboard" onClick={() => {
                            navigator.clipboard.writeText(licenseKey)
                            toast.success("Copied to clipboard")
                        }}>
                            <FiClipboard size={15} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Settings