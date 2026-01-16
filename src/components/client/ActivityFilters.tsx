import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Filters {
  result?: string;
  dateFrom?: string;
  dateTo?: string;
  apiKey?: string;
}

interface ActivityFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function ActivityFilters({ filters, onFiltersChange }: ActivityFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const updateFilter = (key: keyof Filters, value: string | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Result Filter */}
        <div className="space-y-2">
          <Label htmlFor="result">Result</Label>
          <Select 
            value={localFilters.result || 'all'} 
            onValueChange={(value) => updateFilter('result', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="result">
              <SelectValue placeholder="All results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="authentic">Authentic</SelectItem>
              <SelectItem value="tampered">Tampered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label htmlFor="dateFrom" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            From Date
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={localFilters.dateFrom || ''}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label htmlFor="dateTo" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            To Date
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={localFilters.dateTo || ''}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} size="sm">
          Apply Filters
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
