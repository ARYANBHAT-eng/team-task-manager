function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>
      {children}
      {footer ? <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600">{footer}</div> : null}
    </div>
  );
}

export default AuthCard;
