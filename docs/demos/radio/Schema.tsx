import { createForm } from '@formily/core'
import { FormProvider, ISchema, createSchemaField } from '@formily/react'
import {
  FormButtonGroup,
  FormItem,
  Radio,
  Submit,
} from '@thienvu18/formily-antd-v6'
import React from 'react'

const SchemaField = createSchemaField({
  components: {
    Radio,
    FormItem,
  },
})

const form = createForm()

const schema: ISchema = {
  type: 'object',
  properties: {
    radio: {
      type: 'number',
      title: 'Single selection',
      enum: [
        {
          label: 'Option 1',
          value: 1,
        },
        {
          label: 'Option 2',
          value: 2,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
    },
  },
}

const Demo: React.FC = () => {
  return (
    <FormProvider form={form}>
      <SchemaField schema={schema} />
      <FormButtonGroup>
        <Submit onSubmit={console.log}>Submit</Submit>
      </FormButtonGroup>
    </FormProvider>
  )
}

export default Demo
