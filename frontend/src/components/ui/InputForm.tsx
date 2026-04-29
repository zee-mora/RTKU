interface InputFormProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string | 'textarea' | 'text' | 'email' | 'tel' | 'password';
}

const InputForm: React.FC<InputFormProps> = ({ label, required = false, placeholder, type = 'text', ...rest }) => {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-semibold text-gray-700 ${required ? 'required' : ''}`}>
        {label}
      </label>
      <input
        type={type}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
};

export default InputForm;