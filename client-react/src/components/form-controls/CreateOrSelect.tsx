import React, { useContext } from 'react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ChoiceGroup, IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { TextField as OfficeTextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { style } from 'typestyle';
import { Label } from 'office-ui-fabric-react';
import { ThemeContext } from '../../ThemeContext';
import { dropdownStyleOverrides } from './formControl.override.styles';
import { useWindowSize } from 'react-use';

export type NewOrExisting = 'new' | 'existing';

export interface CreateOrSelectFormValues<T> {
  newOrExisting: NewOrExisting;
  existingValue: T | null;
  newValue: string | null;
  loading: boolean;
  onNewOrExistingChange?: (newOrExisting: NewOrExisting) => void;
}

interface CreateOrSelectProps {
  fullpage?: boolean;
  id: string;
  subLabel?: string;
}

const ChioceGroupStyle = style({
  display: 'inline-block',
  width: 'calc(100%-200px)',
});

const CreateOrSelect = (props: FieldProps<CreateOrSelectFormValues<any>> & IChoiceGroupProps & IDropdownProps & CreateOrSelectProps) => {
  const { field, form, options, label } = props;
  const dirty = get(form.initialValues, field.name, null) !== field.value;
  const formValues = field.value as CreateOrSelectFormValues<any>;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();

  const createNewRadioOptions: IChoiceGroupOption[] = [
    {
      key: 'new',
      text: 'Create new',
    },
    {
      key: 'existing',
      text: 'Existing',
    },
  ];

  const onChangeRadio = (e: unknown, option: IChoiceGroupOption) => {
    form.setFieldValue(`${field.name}.newOrExisting`, option.key);
    if (form.values.onNewOrExistingChange) {
      form.values.onNewOrExistingChange(option.key as NewOrExisting);
    }
  };

  const onChangeDropdown = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(`${field.name}.existingValue`, option.data);
  };

  const onChangeText = (e: any, value: string) => {
    form.setFieldValue(`${field.name}.newValue`, value);
  };

  const errorMessage = get(form.errors, field.name, '') as string;

  const fullpage = width > 1000;

  let textOrDropdown: JSX.Element = <span />;
  if (formValues.newOrExisting === 'existing') {
    textOrDropdown = (
      <OfficeDropdown
        placeHolder={form.values.loading ? 'Loading' : ''}
        selectedKey={field.value.existingValue ? field.value.existingValue.id : ''}
        options={options}
        onChange={onChangeDropdown}
        onBlur={field.onBlur}
        errorMessage={errorMessage}
        styles={dropdownStyleOverrides(dirty, theme, fullpage)} // etodo: is this right?
      />
    );
  } else {
    textOrDropdown = (
      <OfficeTextField value={field.value.newValue} onChange={onChangeText} onBlur={field.onBlur} errorMessage={props.errorMessage} />
    );
  }

  return (
    <>
      <Label id={`${props.id}-label`}>{label}</Label>
      <ChoiceGroup
        ariaLabelledBy={`${props.id}-label`}
        id={`${props.id}-radio`}
        className={fullpage ? ChioceGroupStyle : undefined}
        selectedKey={formValues.newOrExisting ? field.value.newOrExisting : 'new'}
        options={createNewRadioOptions}
        onChange={onChangeRadio}
      />

      {textOrDropdown}
    </>
  );
};

export default CreateOrSelect;
