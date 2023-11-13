'use client'

import Image from 'next/image'
import {useState} from "react";
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LicenseInfo } from '@mui/x-license-pro';
import {FormControl, Input, InputLabel, MenuItem, Select, TextField} from "@mui/material";

// @ts-ignore
LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_LICENSE_KEY);


const Form = () => {

}

export default function Home() {
    const [itinerary, setItinerary] = useState<string[]>([])
    const [dateRangeValue, setDateRangeValue] = useState<[Date | null, Date | null]>([null, null])
    const [destination, setDestination] = useState<string>('')
    const [travelers, setTravelers] = useState<number | null>(null)
    const [relationship, setRelationship] = useState<'couple' | 'friends' | 'family' | 'solo' | null>(null)
    const [specialRequests, setSpecialRequests] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isFetching, setIsFetching] = useState(false)
    console.log(itinerary)
    const fetchResults = () => {
        setIsFetching(true)
        setItinerary([])
        setError(null)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        // as YYYY-MM-DD
        const startDateParsed = dateRangeValue[0]?.toISOString().split('T')[0]
        const endDateParsed = dateRangeValue[1]?.toISOString().split('T')[0]
        const fullURL = `${apiUrl}?start_date=${startDateParsed}&end_date=${endDateParsed}&relationship=${relationship}&people_count=${travelers}&destination=${destination}&requests=${specialRequests}`
        // Make the request
        axios.get<null, Number>(fullURL)
            .then(response => {
                console.log(response)
                 if ((response as any).data) {
                        setItinerary((response as any).data.data)
                    } else {
                        setError("An error occurred")
                 }
            })
            .catch(error => {
                console.log(error)
                setError("An error occurred. Check the URL and verify it's a valid Yelp URL and try again.")
            }).finally(() => {
            setIsFetching(false)
        });

    }

    return (
        <main className="flex min-h-screen flex-col items-center max-w-[1200px] m-auto mt-8">
            <h1 className={'text-lg font-bold'}>
                Automatic trip planner!
            </h1>
            <div className={"max-w-[800px] m-auto mt-8"}>
                {itinerary.length > 0 ? <div className={'flex flex-col gap-3'}>
                    <h2 className={'text-lg font-bold'}>Itinerary</h2>
                    {itinerary.map((item, index) => {
                        return (
                            <div key={index}>
                                {(item as any).plan}
                            </div>
                        )
                    })}
                </div> : null
                    }
            </div>
            {!isFetching && (<div className={'flex flex-col gap-3 mt-4'}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateRangePicker localeText={{ start: 'Trip Start', end: 'Trip End' }} value={dateRangeValue} onAccept={
            (newValue) => {
                setDateRangeValue(newValue);
            }
        }/>
    </LocalizationProvider>
                <Input placeholder={'Where are you going?'} value={destination} onChange={
                    (e) => {
                        setDestination(e.target.value)
                    }
                }/>
                <div className={'flex gap-3'}>

                <Input placeholder={'How many travelers?'} type={'number'} value={travelers} onChange={
                    (e) => {
                        setTravelers(parseInt(e.target.value))
                    }
                }/>
                    <FormControl className={'grow'}>
    <InputLabel>Who&apos;s going?</InputLabel>

                <Select className={'w-full grow'} value={relationship} onChange={
                    (e) => {
                        setRelationship(e.target.value as "couple" | "friends" | "family" | "solo" | null)
                    }
                }>
                    <MenuItem value={'couple'}>Couple</MenuItem>
                    <MenuItem value={'friends'}>Friends</MenuItem>
                    <MenuItem value={'family'}>Family</MenuItem>
                    <MenuItem value={'solo'}>Solo</MenuItem>
                </Select>
                    </FormControl>
                    </div>
                        <TextField
                            value={specialRequests}
                            onChange={(e) => {
                                setSpecialRequests(e.target.value)
                            }
                            }
          id="outlined-multiline-static"
          label="Special Requests?"
          multiline
          rows={4}
          />


                <button
                    disabled={isFetching}
                    onClick={fetchResults}
                    className={'border-2 p-2 rounded-xl bg-gray-300 hover:bg-gray-400 active:bg-gray-100'}
                >
                    Get my itinerary!
                </button>

            </div>)}
            <div className={"max-w-[800px] m-auto mt-8"}>
                {isFetching ? "I'm thinking..." : null}
                {error ? <div className={'text-red-500'}>{error}</div> : null}
            </div>
        </main>
    )
}