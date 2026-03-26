import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { score, strength, color } = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s += 20;
    if (password.length >= 12) s += 10;
    if (/[a-z]/.test(password)) s += 20;
    if (/[A-Z]/.test(password)) s += 20;
    if (/[0-9]/.test(password)) s += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(password)) s += 15;

    const finalScore = Math.min(s, 100);
    let str = 'Weak', col = 'danger';
    if (finalScore >= 40 && finalScore < 60) { str = 'Fair'; col = 'warning'; }
    else if (finalScore >= 60 && finalScore < 80) { str = 'Good'; col = 'info'; }
    else if (finalScore >= 80) { str = 'Strong'; col = 'success'; }

    return { score: finalScore, strength: str, color: col };
  }, [password]);

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(password) },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="fw-500">Password Strength:</small>
        <small className={`fw-bold text-${color}`}>{strength}</small>
      </div>
      <div className="progress mb-3" style={{ height: '6px' }}>
        <div className={`progress-bar bg-${color}`} style={{ width: `${score}%` }}></div>
      </div>
      {requirements.map((req, idx) => (
        <div key={idx} className="d-flex align-items-center gap-2 mb-2">
          <i className={`fas fa-${req.met ? 'check' : 'times'} text-${req.met ? 'success' : 'danger'}`}></i>
          <small className={req.met ? 'text-success text-decoration-line-through' : 'text-muted'}>{req.label}</small>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrengthIndicator;
