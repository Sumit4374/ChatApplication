import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export default function MessageInputt({
	value,
	onChange,
	onSend,
	placeholder = "Type a message — press Enter to send",
	sendLabel = "Send",
	disabled = false,
	maxHeight = 120,
}) {
	const isControlled = typeof value === "string";
	const [internalText, setInternalText] = useState("");
	const text = isControlled ? value : internalText;

	const taRef = useRef(null);

	useEffect(() => {
		autosize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text]);

	function autosize() {
		const ta = taRef.current;
		if (!ta) return;
		ta.style.height = "auto";
		const newHeight = Math.min(ta.scrollHeight, maxHeight);
		ta.style.height = `${newHeight}px`;
	}

	function handleChange(e) {
		const next = e.target.value;
		if (isControlled) {
			onChange && onChange(next);
		} else {
			setInternalText(next);
			onChange && onChange(next);
		}
	}

	function handleSend() {
		const trimmed = (text || "").trim();
		if (!trimmed || disabled) return;
		onSend && onSend(trimmed);
		if (!isControlled) setInternalText("");
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	const styles = {
		container: { display: "flex", gap: 8, alignItems: "flex-end", padding: 8 },
		textarea: {
			flex: 1,
			resize: "none",
			padding: "8px 10px",
			borderRadius: 8,
			border: "1px solid #ddd",
			fontSize: 14,
			lineHeight: "1.3",
			minHeight: 40,
			maxHeight,
			overflow: "auto",
		},
		button: {
			padding: "8px 12px",
			borderRadius: 8,
			border: "none",
			background: disabled ? "#9fb7d4" : "#0078d4",
			color: "#fff",
			cursor: disabled ? "not-allowed" : "pointer",
			fontWeight: 600,
		},
	};

	return (
		<div style={styles.container}>
			<textarea
				ref={taRef}
				value={text}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				style={styles.textarea}
				disabled={disabled}
			/>
			<button type="button" onClick={handleSend} style={styles.button} disabled={disabled}>
				{sendLabel}
			</button>
		</div>
	);
}

MessageInputt.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	onSend: PropTypes.func,
	placeholder: PropTypes.string,
	sendLabel: PropTypes.string,
	disabled: PropTypes.bool,
	maxHeight: PropTypes.number,
};