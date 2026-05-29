import { useState, useEffect } from 'react'
import { submitFeedback } from '../api/feedbackApi'
import toast from 'react-hot-toast'
import './FeedbackModal.css'

function FeedbackModal({ open, onClose }) {
    const [type, setType] = useState('Bug')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [visible, setVisible] = useState(open)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        if (open) {
            setVisible(true)
            setClosing(false)
        } else if (visible) {
            setClosing(true)
        }
    }, [open])

    function handleAnimationEnd() {
        if (closing) {
            setVisible(false)
        }
    }

    if (!visible) {
        return null
    }

    function handleSubmit(e) {
        e.preventDefault()

        if (!description.trim()) {
            return
        }

        setSubmitting(true)
        submitFeedback({
            type,
            description,
            metadata: {
                page: window.location.href,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                referrer: document.referrer || 'direct',
                activeElement: document.activeElement?.id || document.activeElement?.tagName || 'unknown'
            }
        })
            .then(() => {
                toast.success('Feedback submitted - thank you')
                onClose()
            })
            .catch(() => {
                toast.error('Failed to submit feedback')
                setSubmitting(false)
            })
    }

    return (
        <div className={`feedback-panel${closing ? ' feedback-panel--closing' : ''}`} onAnimationEnd={handleAnimationEnd}>
            <h2 className="feedback-panel-title">Submit Feedback</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="feedbackType">Type</label>
                    <select id="feedbackType" value={type} onChange={e => setType(e.target.value)}>
                        <option>Bug</option>
                        <option>Feature Request</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="form-field">
                    <label htmlFor="feedbackDescription">Description</label>
                    <textarea id="feedbackDescription" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the issue or idea..." required />
                </div>
                <div className="feedback-panel-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting || !description.trim()}>
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default FeedbackModal