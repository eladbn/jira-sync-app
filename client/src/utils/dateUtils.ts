 
// client/src/utils/dateUtils.ts

/**
 * Formats a date string into a user-friendly format
 * 
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormatOptions to customize format
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string | undefined | null,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };
  
  /**
   * Calculates the relative time from now (e.g., "2 days ago")
   * 
   * @param dateString - ISO date string to calculate from
   * @returns Relative time string
   */
  export const getRelativeTime = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) {
        return 'just now';
      } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      } else {
        return formatDate(dateString, { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error calculating relative time:', error);
      return 'Error';
    }
  };
  
  /**
   * Formats a date range between two dates
   * 
   * @param startDateString - Start date ISO string
   * @param endDateString - End date ISO string
   * @returns Formatted date range string
   */
  export const formatDateRange = (
    startDateString: string | undefined | null,
    endDateString: string | undefined | null
  ): string => {
    if (!startDateString) return 'N/A';
    
    const startFormatted = formatDate(startDateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    if (!endDateString) {
      return `From ${startFormatted}`;
    }
    
    const endFormatted = formatDate(endDateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };