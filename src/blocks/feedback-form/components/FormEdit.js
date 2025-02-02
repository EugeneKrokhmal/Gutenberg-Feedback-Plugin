import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const FormEdit = ({ attributes }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        fetch('/wp-json/wp/v2/users/me', {
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) throw new Error(__('Not logged in', 'feedback-plugin'));
                return res.json();
            })
            .then((user) => {
                setFormData({
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    subject: '',
                    message: ''
                });
            })
            .catch(() => { });
    }, []);

    return (
        <form className="feedback-form">
            <h2 id="feedback-form-title">{__('Feedback Form', 'feedback-plugin')}</h2>
            <div>
                <label htmlFor="firstName">
                    {attributes.labelFirstName}
                    {attributes.isFirstNameRequired && <span className="required">*</span>}
                </label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required={attributes.isFirstNameRequired}
                    aria-required={attributes.isFirstNameRequired}
                    aria-labelledby="firstName-label"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
            </div>

            <div>
                <label htmlFor="lastName">{attributes.labelLastName}</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    aria-labelledby="lastName"
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
            </div>

            <div>
                <label htmlFor="email">
                    {attributes.labelEmail}
                    {attributes.isEmailRequired && <span className="required">*</span>}
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required={attributes.isEmailRequired}
                    value={formData.email}
                    aria-required={attributes.isEmailRequired}
                    aria-labelledby="email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div>
                <label htmlFor="subject">
                    {attributes.labelSubject}
                    {attributes.isSubjectRequired && <span className="required">*</span>}
                </label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    required={attributes.isSubjectRequired}
                    aria-required={attributes.isSubjectRequired}
                    aria-labelledby="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
            </div>

            <div>
                <label htmlFor="message">
                    {attributes.labelMessage}
                    {attributes.isMessageRequired && <span className="required">*</span>}
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required={attributes.isMessageRequired}
                    aria-required={attributes.isMessageRequired}
                    aria-labelledby="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
            </div>

            <button
                className="wp-block-button__link wp-element-button"
                type="submit"
                aria-label={__('Submit Feedback', 'feedback-plugin')}
            >
                {__('Submit', 'feedback-plugin')}
            </button>
        </form>
    );
};

export default FormEdit;
