import { useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import { Input } from '../../Components/Input';
import { LogoMark } from '../../Components/Icons';
import { useToast, ToastContainer } from '../../Components/Toast';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });
    const { toasts, showToast } = useToast();

    // Check for client-side sign-out message or redirect notification
    useEffect(() => {
        try {
            const msg = sessionStorage.getItem('toast_message');
            if (msg) {
                sessionStorage.removeItem('toast_message');
                showToast(msg);
            }
        } catch {
            // Ignore sessionStorage errors
        }
    }, [showToast]);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="auth-page">
            <ToastContainer toasts={toasts} />
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-badge" style={{ width: '44px', height: '44px' }}>
                        <LogoMark size={24} />
                    </div>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to your workspace</p>
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="e.g. rovel@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                        autoFocus
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        autoComplete="current-password"
                        allowTogglePassword
                    />

                    <div style={{ marginTop: '10px' }}>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={processing}
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>

                <div className="auth-footer">
                    <span>Don't have an account? </span>
                    <Link href="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}