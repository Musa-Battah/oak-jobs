import JobSearch from '@/components/JobSearch';
import JobsByIndustryRegion from '@/components/JobsByIndustryRegion';
import RecentJobsBox from '@/components/RecentJobsBox';

export default function HomePage() {
  return (
    <div>
      <section style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '10px', color: '#ffffff' }}>
          Find Your Dream Job
        </h1>
        <p style={{ color: '#cccccc', fontSize: '1.2rem', marginBottom: '20px' }}>
          Discover your next career opportunity with Oak Jobs
        </p>
        <JobSearch />
      </section>

      <section style={{ padding: '40px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '30px', color: '#ffffff' }}>
          Home of Jobs
        </h2>
        <JobsByIndustryRegion />
      </section>

      <section style={{ padding: '20px' }}>
        <RecentJobsBox />
      </section>
    </div>
  );
};