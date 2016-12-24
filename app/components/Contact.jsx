/*
 * Contact.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import BackButton from 'app/components/BackButton';
import { connect } from 'react-redux';
import axios from 'axios';
import { Motion, spring } from 'react-motion';

import { currentPage } from 'app/actions/actions';

class Contact extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            message: '',
            url: '',
            sending: false,
            status: ''
        };

        this.updateEmail = this.updateEmail.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.updateUrl = this.updateUrl.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(currentPage('contact'));
    }

    updateEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    validateEmail() {
        let { email } = this.state;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    updateMessage(e) {
        this.setState({
            message: e.target.value
        });
    }

    updateUrl(e) {
        this.setState({
            url: e.target.value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        let { email, message, url } = this.state;

        let error = {};

        // Try to trick spambots
        if (url !== '') {
            error.url = 'Gotcha, spammer';
        }

        // Validate email
        if (!this.validateEmail(email)) {
            error.email = 'Not a valid email address';
        }

        // Validate message
        if (message === '') {
            error.message = 'Message must not be empty';
        }

        if (Object.keys(error).length !== 0) {
            console.log('there is an error', error);
            alert(`Handle these errors: ${error.email} \n ${error.message}`);
            return;
        }

        this.setState({
            sending: true
        });

        axios.post('/email', {
            sender: this.state.email,
            message: this.state.message,
            url: this.state.url
        }).then(res => {
            this.setState({
                sending: false,
                email: '',
                message: '',
                url: '',
                status: 'Success!'
            });
        }).catch(err => {
            this.setState({
                sending: false,
                email: '',
                message: '',
                url: '',
                status: 'Something went wrong'
            });
        });
    }


    render() {
        const { router, location } = this.props;
        let valid = this.validateEmail() ? 'valid' : 'invalid';
        if (this.state.email === '') {
            valid = 'clear';
        }

        let contactOverlayClassName = 'contact-loading-overlay';
        if (this.state.sending) {
            contactOverlayClassName += ' loading';
        }

        return (
            <div className='contact'>
                <BackButton router={router} url='/' />
                <h1>get in touch</h1>
                <Motion defaultStyle={{opacity: 0, marginTop: 200}}
                    style={{opacity: spring(1), marginTop: spring(0)}}
                >
                    {style => {
                        return (
                            <div style={style} className='contact-content row small-10 medium-8 large-6'>
                                <div className='status'>
                                    <p>{this.state.status}</p>
                                </div>
                                <form className='contact-form' onSubmit={this.handleSubmit}>
                                    <label for='email'>Your Email</label>
                                    <input name='email' className='contact-email' type='text' value={this.state.email} onChange={this.updateEmail} />
                                    <div className={valid}>{ (() => {
                                        if (valid === 'valid') {
                                            return 'OK';
                                        } else if (valid === 'clear') {
                                            return;
                                        }
                                        return 'Not Valid';
                                        })()}
                                    </div>
                                    <label for='message'>Message</label>
                                    <textarea className='contact-message' name='message' value={this.state.message} onChange={this.updateMessage}/>
                                    <input type='text' className='antispam' value={this.state.url} onChange={this.updateUrl} />
                                    <button className='form-submit' type='submit'>Send</button>
                                </form>
                            </div>
                        );
                    }}
                </Motion>
                <div className={contactOverlayClassName}>
                    <div className="sk-fading-circle">
                        <div className="sk-circle1 sk-circle"></div>
                        <div className="sk-circle2 sk-circle"></div>
                        <div className="sk-circle3 sk-circle"></div>
                        <div className="sk-circle4 sk-circle"></div>
                        <div className="sk-circle5 sk-circle"></div>
                        <div className="sk-circle6 sk-circle"></div>
                        <div className="sk-circle7 sk-circle"></div>
                        <div className="sk-circle8 sk-circle"></div>
                        <div className="sk-circle9 sk-circle"></div>
                        <div className="sk-circle10 sk-circle"></div>
                        <div className="sk-circle11 sk-circle"></div>
                        <div className="sk-circle12 sk-circle"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(Contact);
