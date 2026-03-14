


const Button = ({type, name, onClick, style, id, label}) => {

    const handleClick = (e) => {
        if (typeof onClick === 'function') {
            onClick(e);
        }
    }

    return (
        <>
            <button type={type} name={name} onClick={handleClick} style={style} id={id}>{label}</button>
        </>
    );
};

export default Button;