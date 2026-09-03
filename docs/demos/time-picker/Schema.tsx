import { createForm } from '@formily/core'
import { FormProvider, ISchema, createSchemaField } from '@formily/react'
import {
  FormButtonGroup,
  FormItem,
  Submit,
  TimePicker,
} from '@thienvu18/formily-antd-v6'
import React from 'react'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    TimePicker,
  },
})

const form = createForm()

const schema: ISchema = {
  type: 'object',
  properties: {
    time: {
      title: 'Time',
      'x-decorator': 'FormItem',
      'x-component': 'TimePicker',
      type: 'string',
    },
    '[startTime,endTime]': {
      title: 'Time Range',
      'x-decorator': 'FormItem',
      'x-component': 'TimePicker.RangePicker',
      type: 'string',
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
