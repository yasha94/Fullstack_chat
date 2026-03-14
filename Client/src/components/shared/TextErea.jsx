const TextErea = ({type, name, onChange, style, placeholder}) => {

    const handleChange = (e) => {
        onChange(e);
    }
    return (       
        <textarea type={type} name={name} onChange={handleChange} style={style} placeholder={placeholder}></textarea>
    );
};

export default TextErea;