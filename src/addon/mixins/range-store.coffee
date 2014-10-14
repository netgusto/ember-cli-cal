`import Ember from 'ember'`
`import CalendarTools from 'ember-cli-cal/utilities/calendartools'`

component = Ember.Mixin.create
    
    fetchedRanges: []

    isRangeFetched: (range) ->

        for fetchedRange in @get('fetchedRanges')
            
            if range.start.isSame(fetchedRange.start) or range.start.isAfter(fetchedRange.start)
                
                if range.end.isSame(fetchedRange.end) or range.end.isBefore(fetchedRange.end)
                    return true
                else
                    return false

        return false

    aggregateRange: (rangeB) ->

        #rangeB.start.utc()
        #rangeB.end.utc()

        fetchedRanges = @get('fetchedRanges')

        if fetchedRanges.length == 0
            @set('fetchedRanges', [rangeB])
            return

        # Sorting ranges by start date
        fetchedRanges.sort((a, b) -> a.start.isAfter(b.start))

        newRanges = []

        # 1: A--A   B-----B
        # 2: A--B----B----A
        # 3: A----B--A----B

        rangeBPushed = false
        
        for rangeA in fetchedRanges

            #console.log('B.start:' + rangeB.start.toISOString() + '; B.end:' + rangeB.end.toISOString() + '; A.start:' + rangeA.start.toISOString() + '; A.end: ' + rangeA.end.toISOString())

            if rangeB.start.isAfter(rangeA.end)
                # 1: Ranges are disjoint; we simply add the given range to the collection of fetched ranges
                newRanges.push(rangeB)

                continue

            else
                # => rangeB.start is before rangeA.end or same as rangeA.end

                if rangeB.end.isSame(rangeA.start)
                    # 3: Ranges are consecutive; we do merge them

                    newRanges.push(new CalendarTools.Range(
                        start: rangeB.start.clone()
                        end: rangeA.end.clone()
                    ))

                    rangeBPushed = true

                    continue

                if rangeB.end.isBefore(rangeA.start)

                    # 1: Ranges are disjoint; we push them both

                    newRanges.push(rangeB)
                    newRanges.push(rangeA)

                    rangeBPushed = true
                    continue

                if rangeB.end.isBefore(rangeA.end) or rangeB.end.isSame(rangeA.end)

                    if rangeB.start.isBefore(rangeA.start)

                        # 3: Ranges are overlapping or consecutive; we merge them

                        newRanges.push(new CalendarTools.Range(
                            start: rangeB.start.clone()
                            end: rangeA.end.clone()
                        ))
                    else
                        # 2: Range B is included in range A; we just push Range A
                        newRanges.push(rangeA)

                    rangeBPushed = true
                    continue

                
                # 3: Ranges are overlapping; we merge them
                newRanges.push(new CalendarTools.Range(
                    start: rangeA.start.clone()
                    end: rangeB.end.clone()
                ))

                rangeBPushed = true

        if not rangeBPushed
            # Range B has not been handled; we add it to the fetched range collection
            newRanges.push(rangeB)

        newRanges.sort((a, b) -> a.start.isAfter(b.start))

        @set('fetchedRanges', newRanges)

        return

    debugFetchranges: (->
        
        res = []
        for fRange in @get('fetchedRanges')
            res.push fRange.start.toString() + ' -> ' + fRange.end.toString()

        res.join('\n')

    ).property 'fetchedRanges.@each'

`export default component`