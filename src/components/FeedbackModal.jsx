import { useState, useEffect, useRef } from 'react'
import { submitFeedback } from '../api/feedbackApi'
import toast from 'react-hot-toast'
import './FeedbackModal.css'

function FeedbackModal({ open, onClose }) {
    const [type, setType] = useState('Bug')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [visible, setVisible] = useState(open)
    const [closing, setClosing] = useState(false)
    const formRef = useRef(null)

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

    useEffect(() => {
        if (open) {
            setVisible(true)
            setClosing(false)
        } else if (visible) {
            setClosing(true)
        }
    }, [open])

    useEffect(() => {
        if (!visible) {
            return
        }
        
        function handleKeyDown(e) {
            if (e.code === 'Escape') {
                onClose()
            }

            if ((e.metaKey || e.ctrlKey) && e.code === 'Enter') {
                formRef.current?.requestSubmit()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [visible, onClose])

    function handleAnimationEnd() {
        if (closing) {
            setVisible(false)
            setDescription('')
            setType('Bug')
            setSubmitting(false)
        }
    }

    if (!visible) {
        return null
    }

    return (
        <div className={`feedback-panel${closing ? ' feedback-panel--closing' : ''}`} onAnimationEnd={handleAnimationEnd}>
            <h2 className="feedback-panel-title">Submit Feedback</h2>
            <form ref={formRef} onSubmit={handleSubmit}>
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