import './Input.css';
const Input = ({type, name, id, onChange, onBlur, style, required, placeholder, ref, autoCapitalize, autoCorrect, spellCheck, inputMode, value, pattern, title, maxLength}) => {

    const handleChange = (e) => {
        onChange(e);
    }

    const handleOnBlur = (e) => {
        onBlur(e);
    }

    return (        
        <input 
            type={type} 
            name={name} 
            onChange={handleChange} 
            onBlur={handleOnBlur} 
            style={style} 
            id={id}
            className={`input ${id}`}
            required={required} 
            placeholder={placeholder} 
            ref={ref}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            spellCheck={spellCheck}
            inputMode={inputMode}
            value={value}
            pattern={pattern}
            title={title}
            maxLength={maxLength}
            >
            </input>        
    );
};

export default Input;