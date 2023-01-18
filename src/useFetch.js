import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [url]);

  return { data, error, loading };
};

export const submitUser = async (data) => {
  try {
    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/todos",
      data
    );
    return response;
  } catch (err) {
    console.error(err);
  }
};

export default useFetch;
