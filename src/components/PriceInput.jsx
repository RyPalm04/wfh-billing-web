import { displayPrice, sanitizePrice, formatPrice } from "../utils/price";
import { useState } from 'react'

function PriceInput({ value, onValueChange, onKeyDown, ariaLabel, placeholder = '0.00' }) {
    const [focused, setFocused] = useState(false)

    return (
        <div className="input-price-wrapper">
            <input
                type="text"
                aria-label={ariaLabel}
                className="catalog-input-price"
                value={focused ? value : displayPrice(value)}
                onChange={e => onValueChange(sanitizePrice(e.target.value))}
                onFocus={() => setFocused(true)}
                onBlur={e => {
                    setFocused(false)
                    onValueChange(formatPrice(sanitizePrice(e.target.value)))
                }}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
            />
        </div>
    )
}

export default PriceInput;