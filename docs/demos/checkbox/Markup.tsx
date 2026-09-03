import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import {
  Checkbox,
  FormButtonGroup,
  FormItem,
  Submit,
} from '@thienvu18/formily-antd-v6'
import React from 'react'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Checkbox,
  },
})

const form = createForm()

const Demo: React.FC = () => {
  return (
    <FormProvider form={form}>
      <SchemaField>
        <SchemaField.Boolean
          name="single"
          title="Are you sure"
          x-decorator="FormItem"
          x-component="Checkbox"
        />
        <SchemaField.String
          name="multiple"
          title="Check"
          enum={[
            {
              label: 'Option 1',
              value: 1,
            },
            {
              label: 'Option 2',
              value: 2,
            },
          ]}
          x-decorator="FormItem"
          x-component="Checkbox.Group"
        />
      </SchemaField>
      <FormButtonGroup>
        <Submit onSubmit={console.log}>Submit</Submit>
      </FormButtonGroup>
    </FormProvider>
  )
}
export default Demo
