import { __ } from '@wordpress/i18n';
import { createElement } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
import FormEdit from './components/FormEdit';

const defaultAttributes = {
    labelFirstName: __('First Name', 'feedback-plugin'),
    labelLastName: __('Last Name', 'feedback-plugin'),
    labelEmail: __('Email', 'feedback-plugin'),
    labelMessage: __('Message', 'feedback-plugin'),
    isFirstNameRequired: true,
    isLastNameRequired: true,
    isEmailRequired: true,
    isSubjectRequired: true,
    isMessageRequired: true,
};

/**
 * Render the form
 */
const renderFeedbackForms = () => {
    document.querySelectorAll('.feedback-form-container').forEach((container) => {
        try {
            const attributes = container.dataset.attributes
                ? JSON.parse(container.dataset.attributes)
                : defaultAttributes;

            const root = createRoot(container);
            root.render(createElement(FormEdit, { attributes }));
        } catch (error) {
            console.error(__('Error parsing attributes:', 'feedback-plugin'), error);
        }
    });
};

/**
 * @param {Event} event 
 */
const handleFormSubmit = async (event) => {
    const form = event.target.closest('form.feedback-form');
    if (!form || !(form instanceof HTMLFormElement)) return;

    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    toggleButtonState(submitButton, true, __('Submitting...', 'feedback-plugin'));

    try {
        const formData = new FormData(form);
        formData.append('action', 'submit_feedback');
        formData.append('_wpnonce', feedbackAjax?.nonce);

        const response = await fetch(feedbackAjax?.ajaxUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(__('HTTP error! Status:', 'feedback-plugin') + ` ${response.status}`);

        const data = await response.json();

        if (data.success) {
            form.innerHTML = `<p role="alert">${__('Thank you for your feedback!', 'feedback-plugin')}</p>`;
        } else {
            showAlert(data.message || __('Error submitting feedback.', 'feedback-plugin'));
        }
    } catch (error) {
        console.error(__('Error submitting feedback:', 'feedback-plugin'), error);
        showAlert(__('There was an issue submitting your feedback. Please try again later.', 'feedback-plugin'));
    } finally {
        toggleButtonState(submitButton, false, __('Submit', 'feedback-plugin'));
    }
};

/**
 * @param {HTMLButtonElement} button
 * @param {boolean} isDisabled
 * @param {string} text
 */
const toggleButtonState = (button, isDisabled, text) => {
    if (button) {
        button.disabled = isDisabled;
        button.textContent = text;
    }
};

/**
 * @param {string} message
 */
const showAlert = (message) => {
    alert(message);
};

document.addEventListener('DOMContentLoaded', () => {
    renderFeedbackForms();

    document.body.addEventListener('submit', handleFormSubmit);
});
