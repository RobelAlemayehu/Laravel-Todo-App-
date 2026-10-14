import { Link, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import { Input } from '../../Components/Input';
import { LogoMark } from '../../Components/Icons';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-badge" style={{ width: '44px', height: '44px' }}>
                        <LogoMark size={24} />
                    </div>
                    <h1 className="auth-title">Create an account</h1>
                    <p className="auth-subtitle">Start organizing your todos with ease</p>
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        label="Name"
                        placeholder="e.g. Rovel"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        autoComplete="name"
                        autoFocus
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="e.g. rovel@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        autoComplete="new-password"
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
                            {processing ? 'Creating account...' : 'Create account'}
                        </Button>
                    </div>
                </form>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}