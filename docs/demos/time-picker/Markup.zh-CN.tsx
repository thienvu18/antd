import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import {
  FormButtonGroup,
  FormItem,
  Submit,
  TimePicker,
} from '@thienvu18/formily-antd-v6'
import React from 'react'

const SchemaField = createSchemaField({
  components: {
    TimePicker,
    FormItem,
  },
})

const form = createForm()

const Demo: React.FC = () => {
  return (
    <FormProvider form={form}>
      <SchemaField>
        <SchemaField.String
          name="time"
          title="时间"
          required
          x-decorator="FormItem"
          x-component="TimePicker"
        />
        <SchemaField.String
          name="[startTime,endTime]"
          title="时间范围"
          x-decorator="FormItem"
          x-component="TimePicker.RangePicker"
        />
      </SchemaField>
      <FormButtonGroup>
        <Submit onSubmit={console.log}>提交</Submit>
      </FormButtonGroup>
    </FormProvider>
  )
}
export default Demo
