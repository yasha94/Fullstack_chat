import { useState, useEffect, useRef } from 'react';
import { getAll } from '../../../services/crud/crud';

const CustomInfiniteScroll = ({ url, component, getItems, loadingDown = true }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const Component = component

  const fetchItems = async () => {
    setLoading(true);
    // Simulate API call with pagination
    const response = await fetch(`/api/items?page=${page}`);
    const newItems = await response.json();
    setItems((prevItems) => [...prevItems, ...newItems]);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [page]); // Re-fetch when page changes

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 } // Trigger when 100% of loader is visible
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading]); // Re-observe when loading state changes

  return (
    <>
        {!loadingDown && <div ref={loaderRef}>{loading && 'Loading more items...'}</div>}
        <Component items={items}/>
        {loadingDown && <div ref={loaderRef}>{loading && 'Loading more items...'}</div>}
    </>
  );
}

export default CustomInfiniteScroll;