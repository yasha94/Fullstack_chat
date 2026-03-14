import { useMemo } from 'react';
import Input from '../input/Input';
import Button from '../Button';
import authContext from '../../../context/AuthProvider';
import useAppTheme from '../../../hooks/useAppTheme';
import { faCheck, faXmark, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import {faCircleCheck} from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Form.css';

const Form = ({ formData, onChange, onBlur, onClick, style, method = 'post', encType, formAutocomplete="on"}) => {

    const {appTheme} = useAppTheme();
    const ulClassName = appTheme ? 'ulDarkTheme' : 'ulLightTheme'
    const renderForm = (field) => {
        return useMemo(() => {
            const Component = field.component || Input;
            return (
                <div key={String(field?.id)}>
                    <span style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'left', width: 'fit-content'}}>
                        {field.showLabel && <label className='formLabel' htmlFor={String(field?.id)}> {String(field.label)}:  </label>}
                        <Component id={String(field?.id)} type={String(field.type)} name={String(field.name)} onChange={onChange} onBlur={onBlur} required={field.required} placeholder={field.placeholder} label={field.label} ref={field.ref} style={field.style} inputmode={field.inputmode} value={field.value}/>
                        <FontAwesomeIcon icon={field.icon?.icon} color={field.icon?.color} size={field.icon?.size} style={{marginLeft: '5px'}}/>
                    </span>
                    {Array.isArray(field.error?.data) && <ul style={field.error?.style} className={field.error?.data? `errorList ${ulClassName}` : 'errorList'}>
                        {field.error?.data.map((err => {
                            return (
                                <li key={err}>
                                    {err}
                                </li>
                            )
                        }))}
                    </ul>}
                </div>
            );
        }, [onBlur]);
    }

    const fields = [];
    const buttons = [];

    formData.forEach(field => {
        const rendered = renderForm(field);
        if (field.component === Button) {
            buttons.push(rendered);
        } else {
            fields.push(rendered);
        }
    });

    return (
        <form style={style} method={method} encType={encType} onSubmit={onClick} className='form' autoComplete={formAutocomplete}>
            {fields}
            {buttons.length > 1 ? (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' ,gap: '25px', paddingLeft: '25%', width: 'fit-content' }}>
                    {buttons}
                </div>
            )
            :
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1px', width: 'fit-content' }}>
                    {buttons}
                </div>}
        </form>
    );

};

export default Form;





/*'
    /* <form style={style} method='post'>
            {Object.entries(formData).map(([label, type], i) => (
                renderInput(label, type, i)
            ))}
            <Button type={'submit'} onClick={onClick}/>
    /*  </form> 
*/
