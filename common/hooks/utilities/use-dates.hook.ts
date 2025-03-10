import moment from 'moment'

export enum RelativeDateEnum {
	LAST_3_MONTHS = 'last_3_months',
	LAST_6_MONTHS = 'last_6_months',
	LAST_24_MONTHS = 'last_24_months',
	THIS_MONTH = 'this_month',
	THIS_YEAR = 'this_year',
}

export const useDates = () => {
	const getRelativeDates = (date: string, relativeDate: RelativeDateEnum) => {
		const startDate = moment(date)
		const endDate = moment(date)

		switch (relativeDate) {
			case RelativeDateEnum.LAST_3_MONTHS:
				startDate.subtract(3, 'month').startOf('month')
				endDate.endOf('month')
				break
			case RelativeDateEnum.LAST_6_MONTHS:
				startDate.subtract(6, 'month').startOf('month')
				endDate.endOf('month')
				break
			case RelativeDateEnum.LAST_24_MONTHS:
				startDate.subtract(24, 'month').startOf('month')
				endDate.endOf('month')
				break
			case RelativeDateEnum.THIS_MONTH:
				startDate.startOf('month')
				endDate.endOf('month')
				break
			case RelativeDateEnum.THIS_YEAR:
				startDate.startOf('year')
				endDate.endOf('year')
				break
		}

		return { startDate, endDate }
	}

	return { getRelativeDates }
}
