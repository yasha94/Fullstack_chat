import './Ul.css';

const Ul = (ulData) => {

    return (
        <ul className={`ul ${ulClassName}`} style={ulStyle}>
            {Array.isArray(ulData) ? field.error.map((ulD => {
                return (
                    ulD && 
                    <li style={ulStyle} key={ulD}>
                        {ulD}
                    </li>
                )
            })) : ulData}
        </ul>
    )
}

export default Ul;