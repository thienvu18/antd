import { createForm } from '@formily/core'
import { FormProvider, ISchema, createSchemaField } from '@formily/react'
import {
  FormButtonGroup,
  FormItem,
  Submit,
  Switch,
} from '@thienvu18/formily-antd-v6'
import React from 'react'

const SchemaField = createSchemaField({
  components: {
    Switch,
    FormItem,
  },
})

const form = createForm()

const schema: ISchema = {
  type: 'object',
  properties: {
    switch: {
      type: 'boolean',
      title: 'Switch',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
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
